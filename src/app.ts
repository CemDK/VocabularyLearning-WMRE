/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { ButtonBehavior, Color4, Sound } from '@microsoft/mixed-reality-extension-sdk';
import { ClientPreprocessing } from '@microsoft/mixed-reality-extension-sdk/built/internal/protocols';

/**
 * The structure of a vocabulary entry in the vocabulary database.
 */
type VocabDescriptor = {
	displayName: string;
	resourceName: string;
	translation: string;
	state: string;
	phonetics: string;
	pronunciation: string;
	texture: string;
	scale: {
		x: number;
		y: number;
		z: number;
	};
	rotation: {
		x: number;
		y: number;
		z: number;
	};
	position: {
		x: number;
		y: number;
		z: number;
	};
};

type VocabDatabase = {
	[key: string]: VocabDescriptor;
};

// Load the database of vocabs.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const VocabDatabase: VocabDatabase = require('../public/vocab.json');

/**
 * SetupMarket Application - Showcasing avatar attachments.
 */
export default class SetupMarket {
	// Container for preloaded prefabs (3d models of the food).
	private assets: MRE.AssetContainer;
	private prefabs: { [key: string]: MRE.Prefab } = {};
	private sounds: { [key: string]: MRE.Sound } = {};
	/**
	 * Constructs a new instance of this class.
	 * @param context The MRE SDK context.
	 * @param baseUrl The baseUrl to this project's `./public` folder.
	 */
	constructor(private context: MRE.Context, private baseUrl: string, private baseDir: string) {
		this.assets = new MRE.AssetContainer(context);
		// Hook the context events we're interested in.
		this.context.onStarted(() => this.started());
		//this.context.onUserLeft(user => this.userLeft(user));
	}

	private async started() {
		// Check whether code is running in a debuggable watched filesystem
		// environment and if so delay starting the app by 1 second to give
		// the debugger time to detect that the server has restarted and reconnect.
		// The delay value below is in milliseconds so 1000 is a one second delay.
		// You may need to increase the delay or be able to decrease it depending
		// on the speed of your PC.
		console.log("Hello World");
		const delay = 1000;
		const argv = process.execArgv.join();
		const isDebug = argv.includes('inspect') || argv.includes('debug');

		// // version to use with non-async code
		// if (isDebug) {
		// 	setTimeout(this.startedImpl, delay);
		// } else {
		// 	this.startedImpl();
		// }

		// version to use with async code
		if (isDebug) {
			await new Promise(resolve => setTimeout(resolve, delay));
			await this.startedImpl();
		} else {
			await this.startedImpl();
		}
	}

	// use () => {} syntax here to get proper scope binding when called via setTimeout()
	// if async is required, next line becomes private startedImpl = async () => {
	private startedImpl = async () => {
		// Preload all the models and sounds
		await this.loadVocabulary();
		await this.loadSounds();
		this.showVocabulary();
	}

	/**
	 * Show the Vocabulary with its menus and 3d models
	*/
	private showVocabulary() {
		// Create a parent object for all the menu items.
		const menu = MRE.Actor.Create(this.context, {});
		// Create menu button
		let buttonWidth = 0.3;
		const buttonMesh = this.assets.createBoxMesh('button', buttonWidth, buttonWidth, 0.01);

		// Loop over the vocabular database, creating a menu item for each entry.
		for (const vocabId of Object.keys(VocabDatabase)) {
			// Create a clickable button.
			const vocabRecord = VocabDatabase[vocabId];
			if(vocabRecord.resourceName){
				console.log(vocabId);
				console.log(vocabRecord);

				const vocabMenu = MRE.Actor.Create(this.context, {
					actor: {
						parentId: menu.id,
						name: vocabId + "Menu",
						transform:{
							local: {
								position: {
									x: vocabRecord.position.x,
									y: vocabRecord.position.y,
									z: vocabRecord.position.z,
								},
								rotation: MRE.Quaternion.FromEulerAngles(
									vocabRecord.rotation.x * MRE.DegreesToRadians,
									vocabRecord.rotation.y * MRE.DegreesToRadians,
									vocabRecord.rotation.z * MRE.DegreesToRadians)
							}
						}
					}
					
				})
				const vocabModel = MRE.Actor.CreateFromPrefab(this.context, {
					prefab: this.prefabs[vocabId],
					actor: {
						parentId: vocabMenu.id,
						transform: {
							local: {
								position: { 
									x: 0 + 2*buttonWidth,
									y: 0 - 0.1, 
									z: 0},
								rotation: MRE.Quaternion.FromEulerAngles(
									vocabRecord.rotation.x * MRE.DegreesToRadians,
									vocabRecord.rotation.y * MRE.DegreesToRadians,
									vocabRecord.rotation.z * MRE.DegreesToRadians),
								scale: vocabRecord.scale,
							}
						},
				}});


				const translateButton = MRE.Actor.Create(this.context, {
					actor: {
						parentId: vocabMenu.id,
						name: vocabId,
						appearance: { meshId: buttonMesh.id },
						collider: { geometry: { shape: MRE.ColliderType.Auto } },
						transform: {
							local: { 
								position: { 
									x: 0, 
									y: 0.4, 
									z: 0} }
						}
					}
				});


				const soundButton = MRE.Actor.Create(this.context, {
					actor: {
						parentId: vocabMenu.id,
						name: vocabId,
						appearance: { meshId: buttonMesh.id },
						collider: { geometry: { shape: MRE.ColliderType.Auto } },
						transform: {
							local: { 
								position: { 
									x: 0, 
									y: 0, 
									z: 0} }
						}
					}
				});

				// Create a label for the menu entry.
				let textLabel = MRE.Actor.Create(this.context, {
					actor: {
						parentId: vocabMenu.id,
						name: 'label',
						text: {
							contents: VocabDatabase[vocabId].displayName,
							height: 0.2,
							anchor: MRE.TextAnchorLocation.BottomLeft,
							color: MRE.Color3.Yellow()
						},
						transform: {
							local: { 
								position: { 
									x: 0 + buttonWidth,
									y: 0.3,
									z: 0} }
						},
					}
				});

				const soundActor = MRE.Actor.Create(this.context, {
					actor: {
						parentId: menu.id,
						name: 'soundActor',
						transform: {
							local: {
								position: {
									x: vocabRecord.position.x,
									y: vocabRecord.position.y, 
									z: vocabRecord.position.z }
							}
						}
					}
				});


				console.log("Assigning button behaviour next");
				// Set a click handler on the button.
				translateButton.setBehavior(MRE.ButtonBehavior)
					.onClick(user => this.changeState(vocabId, user.id, textLabel));

				soundButton.setBehavior(MRE.ButtonBehavior)
					.onClick(user => this.playSound(vocabId, user.id, soundActor));

			}
		}
	}
		
	/**
	 * Preload all resources. This makes instantiating them faster and more efficient.
	 */
	private loadVocabulary() {
		// Loop over the vocab database, preloading each resource.
		// Return a promise of all the in-progress load promises. This
		// allows the caller to wait until everything is done preloading
		// before continuing.
		return Promise.all(
			Object.keys(VocabDatabase).map(vocabId => {
				const vocabRecord = VocabDatabase[vocabId];
				if (vocabRecord.resourceName) {
					return this.assets.loadGltf(vocabRecord.resourceName)
						.then(assets => {
							this.prefabs[vocabId] = assets.find(a => a.prefab !== null) as MRE.Prefab;
						})
						.catch(e => MRE.log.error("shit... app", e));
				} else {
					return Promise.resolve();
				}
			}));
	}

	private loadSounds() {
		console.log("Loading sounds...")
		return Promise.all(
			Object.keys(VocabDatabase).map(vocabId => {
				const vocabRecord = VocabDatabase[vocabId];
				console.log(vocabRecord.pronunciation);
				console.log(this.baseDir,'/',vocabRecord.pronunciation);
				let uri = this.baseDir +'/'+ vocabRecord.pronunciation;
				console.log(uri);
				return this.sounds[vocabId] = this.assets.createSound(vocabId, { uri: uri})
			})
		);
    }

	private changeState(vocabId: string, userId: MRE.Guid, textLabel: MRE.Actor) {
		const vocabRecord = VocabDatabase[vocabId];
		switch (vocabRecord.state) {
			case "initial":
				textLabel.text.contents = vocabRecord.displayName;
				vocabRecord.state = "translated";
				break;
			case "translated":
				textLabel.text.contents = vocabRecord.translation;
				vocabRecord.state = "phonetics";
				break;
			case "phonetics":
				textLabel.text.contents = vocabRecord.phonetics;
				vocabRecord.state = "initial";
				break;
		}
	}

	private playSound(vocabId: string, userId: MRE.Guid, textLabel: MRE.Actor){
		textLabel.startSound(this.sounds[vocabId].id, 
			{
				volume: 1,
				looping: false
			});
	}
}