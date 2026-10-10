import { goto } from '$app/navigation';
import { openSettings } from '#lib/stores/settings.ts';
import {
	Axe,
	Gamepad2,
	GraduationCap,
	Settings,
	Map,
	MessageSquareText,
	Heart,
	Home,
	Scroll,
	Sparkles,
	Sword
} from '@lucide/svelte';
import type { LucideProps } from '@lucide/svelte';
import type { Component } from 'svelte';

export type CommandGroup = {
	title: string;
	commands: CommandType[];
};

export type CommandType = {
	icon: Component<LucideProps>;
	label: string;
	keywords: string[];
	action: (...args: any[]) => any;
	options?: CommandOption[];
};

export type CommandOption = {
	icon: Component<LucideProps>;
	label: string;
	value: string;
};

export const commandGroups: CommandGroup[] = [
	{
		title: 'Navigation',
		commands: [
			{
				label: 'Home',
				icon: Home,
				keywords: ['Home', 'Navigation'],
				action: () => goto('/')
			},
			{
				label: 'Gamemodes',
				icon: Gamepad2,
				keywords: ['Gamemodes', 'Navigation'],
				options: [
					{
						label: 'Weapon',
						value: 'weapon',
						icon: Axe
					},
					{
						label: 'Weapon 2',
						value: 'weapon-2',
						icon: Sword
					},
					{
						label: 'Map',
						value: 'map',
						icon: Map
					},
					{
						label: 'Cosmetic',
						value: 'cosmetic',
						icon: GraduationCap
					},
					{
						label: 'Unusual',
						value: 'unusual',
						icon: Sparkles
					}
				],
				action: (gamemode: string) => goto(`/game-modes/${gamemode}`)
			},
			{
				label: 'Patch notes',
				icon: Scroll,
				keywords: ['Patch notes', 'Navigation'],
				action: () => goto('/patch-notes')
			}
		]
	},
	{
		title: 'Preferences',
		commands: [
			{
				label: 'Settings',
				icon: Settings,
				keywords: ['Settings', 'Preferences'],
				action: () => openSettings.set(true)
			}
		]
	},
	{
		title: 'Other',
		commands: [
			{
				label: 'Give feedback',
				icon: MessageSquareText,
				keywords: ['Give feedback', 'Other'],
				action: () => window.open('https://www.reddit.com/user/jaakim/', '_blank')
			},
			{
				label: 'Support this page',
				icon: Heart,
				keywords: ['Support this page', 'Other'],
				action: () => window.open('https://buymeacoffee.com/joakimedvam', '_blank')
			}
		]
	}
];

export const allCommands = commandGroups
	.flatMap((group) => group.commands)
	.flatMap((command) => {
		let commands = [command.label];
		command.options?.forEach((option) => {
			commands.push(option.label);
		});
		return commands;
	});

export function findCommand(label: string) {
	let found = null;
	let i = 0;
	while (!found && i < commandGroups.length) {
		let j = 0;
		while (!found && j < commandGroups[i].commands.length) {
			if (commandGroups[i].commands[j].label.toLowerCase() === label.toLowerCase()) {
				found = commandGroups[i].commands[j];
			}
			j++;
		}
		i++;
	}

	return found;
}
