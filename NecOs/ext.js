(async function (Scratch) {
	'use strict';

	let LsSprID = '';

	// ライブラリ読み込みとかその辺の関数
	async function Extension_Setup() {
		const loadNDT = () => {
			if (window.NDT) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src =
					'https://nyantorusabu.github.io/NDT/NekoDevTools.js';
				script.onload = resolve;
				script.onerror = reject;
				document.body.appendChild(script);
			});
		};
		const loadfflate = () => {
			if (window.fflate) return Promise.resolve();
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://unpkg.com/fflate@0.8.2';
				script.onload = resolve;
				script.onerror = reject;
				document.body.appendChild(script);
			});
		};

		await loadNDT();
	}

	class NecOsExt {
		getInfo() {
			return GenerateBlocksInfo(
				'NecOs',
				'NecOs',
				blocks(
					block(
						'send',
						'C',
						'Terminalに [Log] を送信',
						arg('Log', 'S', 'hoge'),
					),
					block(
						'runCMD',
						'C',
						'コマンド [Text] を解釈して実行',
						arg('Text', 'S', 'echo test'),
					),
					block(
						'upload',
						'R',
						'[Type] のアップロードを要求',
						arg('Type', 'S', '.sprite3'),
					),
					block(
						'AddSprite',
						'C',
						'APPを [URL] から追加',
						arg('URL', 'S'),
					),
					block('DelSprite', 'C', 'APP [ID] を削除', arg('ID', 'S')),
					block('StopSprite', 'C', 'APP [ID] を停止', arg('ID', 'S')),
					block('LsSprite', 'R', '最後に操作をしたAPPのID'),
					block('Help', 'C', 'APP [ID] の説明を取得', arg('ID', 'S')),
				),
			);
		}

		send(args) {
			NDT.List.Get('Message').push(args.Log);
		}

		runCMD(args) {
			let List = [''];
			let q = false;
			let dq = false;
			for (const now of String(args.Text)) {
				if (q) {
					if (now == "'") {
						q = false;
					} else {
						List[List.length - 1] = List[List.length - 1] + now;
					}
				} else if (dq) {
					if (now == '"') {
						dq = false;
					} else {
						List[List.length - 1] = List[List.length - 1] + now;
					}
				} else {
					if (now == "'") {
						q = true;
					} else if (now == '"') {
						dq = true;
					} else if (now == ' ') {
						List.push('');
					} else {
						List[List.length - 1] = List[List.length - 1] + now;
					}
				}
			}

			const cmd = List[0];
			if (!NDT.Spr.NameList.includes(cmd)) {
				NDT.List.Get('Message').push(
					`APP"${cmd}"は見つかりませんでした。`,
				);
				return;
			}
			NDT.List.Get('Message').push(`> ${List.join(' ')}`);
			List = List.slice(1);
			NDT.List.SetArray('CMD', List);
			NDT.Spr.Eve.Message(cmd, 'RUN');
		}

		async upload(args) {
			return String(await NDT.Upload(args.Type));
		}

		async AddSprite(args) {
			LsSpr = (await NDT.Spr.Add(args.URL)).getName();
		}

		DelSprite(args) {
			LsSpr = NDT.Spr.Get(args.ID).getName();
			NDT.Spr.Delete(args.ID);
		}

		StopSprite(args) {
			LsSpr = NDT.Spr.Get(args.ID).getName();
			NDT.Spr.Eve.Stop(args.ID);
		}

		LsSprite() {
			return String(LsSprID);
		}

		Help(args) {
			if (!NDT.Spr.NameList.includes(args.ID)) {
				NDT.List.Get('Message').push(
					`${args.ID}が見つかりませんでした。`,
				);
				return;
			}
			NDT.Spr.Eve.Message(args.ID, 'HELP');
		}
	}

	// NyankoExtensionCreater
	// 短縮表現変換
	function abbreviation(code, ...link) {
		for (const word of link) {
			if (code.toLowerCase().startsWith(word.toLowerCase()[0])) {
				return word;
			}
		}
		log('w', `引数として想定されていない値が入力されました: ${code}`);
		return code;
	}
	// ログ
	function log(type = 'log', output) {
		const lstype = abbreviation(type, 'log', 'warn', 'error');
		console[lstype](`[NEC] ${output}`);
	}
	// 型チェック
	function chktype(data, type) {
		if (typeof data !== type) {
			log(
				'e',
				`引数に指定できない型が指定されています!: 入力=>${typeof data} 要求=>${type}`,
			);
		}
	}

	// getInfo
	function GenerateBlocksInfo(id, name, blocks = {}, option = {}) {
		chktype(blocks, 'object');
		chktype(option, 'object');
		return {
			...{
				id: id,
				name: name,
				blocks: blocks,
			},
			...option,
		};
	}
	// ラベル
	function label(labeltext) {
		chktype(labeltext, 'string');
		return { blockType: 'label', text: labeltext };
	}
	function block(opcode, type, text, args = {}) {
		chktype(type, 'string');
		chktype(text, 'string');
		chktype(args, 'object');
		// typeの短縮変換
		const lstype = abbreviation(
			type,
			'COMMAND',
			'REPORTER',
			'BOOLEAN',
			'HAT',
			'EVENT',
		);

		// argsの確認
		const allblockargs =
			text.match(/\[(.*?)\]/g)?.map((s) => s.slice(1, -1)) || [];
		const allinputargs = Object.keys(args);
		for (const chk of allblockargs) {
			if (!allinputargs.includes(chk)) {
				log(
					'w',
					`block"${opcode}"に必要なargが渡されていません: ${chk}`,
				);
			}
		}
		for (const chk of allinputargs) {
			if (!allblockargs.includes(chk)) {
				log(
					'w',
					`block"${opcode}"に不必要なargが渡されています: ${chk}`,
				);
			}
		}
		return {
			opcode: opcode,
			blockType: Scratch.BlockType[lstype],
			text: text,
			arguments: args,
		};
	}
	function blocks(...blocks) {
		chktype(blocks, 'object');
		return blocks;
	}
	function arg(id, type, def = '', menu = '') {
		chktype(type, 'string');
		const lstype = abbreviation(
			type,
			'STRING',
			'NUMBER',
			'BOOLEAN',
			'COSTUME',
			'SOUND',
			'ANGLE',
			'MATRIX',
			'NOTE',
			'IMAGE',
			'COLOR',
		);
		return {
			[id]: {
				type: Scratch.ArgumentType[lstype],
				defaultValue: def,
				menu: menu,
			},
		};
	}
	function args(...args) {
		chktype(args, 'object');
		return Object.assign({}, ...args);
	}

	await Extension_Setup();
	Scratch.extensions.register(new NecOsExt());
})(Scratch);
