<div class="hat" aria-hidden="true">
	<div class="cone"></div>
	<div class="band"></div>
	<div class="buckle"></div>
	<div class="brim"></div>
</div>

<style>
	.hat {
		position: relative;
		height: 3.75rem;
		width: 5rem;
	}

	.cone {
		position: absolute;
		left: 1.05rem;
		top: 0;
		height: 3.1rem;
		width: 2.65rem;
		background: linear-gradient(140deg, #4c1d95 0%, #170422 65%, #050008 100%);
		clip-path: polygon(54% 0, 100% 100%, 0 100%);
		filter: drop-shadow(0 0 0.4rem rgba(249, 115, 22, 0.35));
	}

	.band {
		position: absolute;
		left: 1.32rem;
		top: 2.35rem;
		height: 0.42rem;
		width: 2.1rem;
		background: #f97316;
		transform: skewX(-11deg);
	}

	.buckle {
		position: absolute;
		left: 2.05rem;
		top: 2.22rem;
		height: 0.65rem;
		width: 0.7rem;
		border: 2px solid #facc15;
		border-radius: 0.1rem;
	}

	.brim {
		position: absolute;
		left: 0.2rem;
		top: 2.75rem;
		height: 0.82rem;
		width: 4.4rem;
		background: linear-gradient(90deg, #050008, #3b0764 45%, #050008);
		border-radius: 999px 999px 45% 45%;
		box-shadow: 0 0.16rem 0 rgba(249, 115, 22, 0.55);
	}
</style>
