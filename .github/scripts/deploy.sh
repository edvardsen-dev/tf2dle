#!/usr/bin/env bash
set -euo pipefail

IMAGE_REPOSITORY=ghcr.io/edvardsen-dev/tf2dle/sveltekit
export IMAGE_URL="$IMAGE_REPOSITORY:$DEPLOY_TAG"

command -v curl >/dev/null
docker compose version
echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
cd "$APP_DIR"

# Capture IDs before pulling so images that lose their tag are still attributable.
image_ids=$(docker image ls --no-trunc --format '{{.Repository}} {{.ID}}' |
  while read -r repository image_id; do
    if [[ "$repository" == "$IMAGE_REPOSITORY" ]]; then
      echo "$image_id"
    fi
  done | sort -u)

# Regenerate .env so corrected secrets are applied on every deployment.
umask 077
cat > .env <<EOF
DATABASE_URL=${DATABASE_URL}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}
ORIGIN=${ORIGIN}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
EOF

docker compose -f docker-compose.prod.yaml pull
expected_image=$(docker image inspect --format '{{.Id}}' "$IMAGE_URL")
docker compose -f docker-compose.prod.yaml up -d
app_container=$(docker compose -f docker-compose.prod.yaml ps -q app)

ready=false
if [[ -n "$app_container" ]]; then
  for attempt in {1..30}; do
    container_state=$(docker inspect --format '{{.Image}} {{.State.Running}}' "$app_container")
    if [[ "$container_state" == "$expected_image true" ]] &&
      curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3010/ >/dev/null; then
      ready=true
      break
    fi
    sleep 2
  done
fi

if [[ "$ready" != true ]]; then
  echo 'App startup check failed. Old images have not been removed.' >&2
  docker compose -f docker-compose.prod.yaml ps
  docker compose -f docker-compose.prod.yaml logs --tail 100 app
  exit 1
fi

while IFS= read -r image_id; do
  [[ -n "$image_id" && "$image_id" != "$expected_image" ]] || continue

  # Include stopped containers; a later restart may still need their images.
  containers=$(docker ps -aq --filter "ancestor=$image_id")
  if [[ -n "$containers" ]]; then
    echo "Keeping image $image_id: referenced by a container."
    continue
  fi

  if ! references=$(docker image inspect --format '{{range .RepoTags}}{{println .}}{{end}}{{range .RepoDigests}}{{println .}}{{end}}' "$image_id"); then
    continue
  fi
  tags=()
  shared=false
  while IFS= read -r reference; do
    [[ -n "$reference" ]] || continue
    if [[ "$reference" == *@* ]]; then
      if [[ "${reference%%@*}" != "$IMAGE_REPOSITORY" ]]; then
        shared=true
        break
      fi
      continue
    fi
    if [[ "${reference%:*}" != "$IMAGE_REPOSITORY" ]]; then
      shared=true
      break
    fi
    tags+=("$reference")
  done <<< "$references"

  if [[ "$shared" == true ]]; then
    echo "Keeping image $image_id: also referenced by another repository."
    continue
  fi

  # Remove all app tags, or a captured image that became dangling, without force.
  if [[ ${#tags[@]} -eq 0 ]]; then
    tags=("$image_id")
  fi
  if ! docker image rm "${tags[@]}"; then
    echo "Warning: could not remove unused app image $image_id." >&2
  fi
done <<< "$image_ids"
