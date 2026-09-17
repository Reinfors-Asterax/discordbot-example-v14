const nodeVersion = process.version.slice(1, 3);
const MONEY = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
const yes = ['yes', 'y', 'ye', 'yeah', 'yup', 'yea', 'ya'];
const no = ['no', 'n', 'nah', 'nope', 'nop'];

class Util {
	/**
	 * Prompts the user for a "yes" or "no" response and returns the choice.
	 * @param {Object} channel - The Discord channel to send the prompt in.
	 * @param {Object} user - The Discord user to receive the prompt.
	 * @param {number} [time=30000] - Time in milliseconds to wait for a response.
	 * @returns {Promise<boolean>} - Returns a promise that resolves to true if "yes" was chosen, false if "no".
	 */
	static async verifyText(channel, user, time = 30000) {
		const filter = res => {
			const value = res.content.toLowerCase();
			return res.author.id === user.id && (yes.includes(value) || no.includes(value));
		};
		const verify = await channel.awaitMessages(filter, {
			max: 1,
			time,
		});
		if (!verify.size) return 0;
		const choice = verify.first().content.toLowerCase();
		if (yes.includes(choice)) return true;
		if (no.includes(choice)) return false;
		return false;
	}

	/**
	 * Generates a progress bar string based on current progress and maximum value.
	 * @param {number} current - The current progress value.
	 * @param {number} max - The maximum progress value.
	 * @param {number} length - The length of the progress bar.
	 * @returns {string} - The progress bar string.
	 */
	static getProgbar(current, max, length) {
		const curBer = Math.floor((current / max) * length);
		let str = '';
		for (let i = 0; i < length; i++) {
			str += i < curBer ? '✅' : '⬜';
		}
		return str;
	}

	/**
	 * Formats a number with suffixes (K, M, G, etc.) for easier readability.
	 * @param {number} number - The number to format.
	 * @returns {string} - The formatted number with suffix.
	 */
	static crFormat(number) {
		const peringkat = Math.log10(number) / 3 | 0;
		if (!peringkat) return number.toString();
		const last = MONEY[peringkat];
		const skala = Math.pow(10, peringkat * 3);
		const skalad = number / skala;
		return `${skalad.toFixed(2)}${last}`;
	}

	/**
	 * Converts seconds into a time string formatted as HH:MM:SS or MM:SS.
	 * @param {number} seconds - The number of seconds.
	 * @param {boolean} [forceHours=false] - Whether to force hours to be included in the output.
	 * @returns {string} - The formatted time string.
	 */
	static timeString(seconds, forceHours = false) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor(seconds % 3600 / 60);

		return `${forceHours || hours >= 1 ? `${hours}:` : ''}${hours >= 1 ? `0${minutes}`.slice(-2) : minutes}:${`0${Math.floor(seconds % 60)}`.slice(-2)}`;
	}

	/**
	 * Wraps text into chunks of a specified length.
	 * @param {string} text - The text to wrap.
	 * @param {number} length - The maximum length of each chunk.
	 * @returns {string[]} - An array of text chunks.
	 */
	static getWrapText(text, length) {
		const temp = [];
		for (let i = 0; i < text.length; i += length) {
			temp.push(text.slice(i, i + length));
		}
		return temp.map(x => x.trim());
	}

	/**
	 * Returns a promise that resolves after a specified delay.
	 * @param {number} ms - The delay time in milliseconds.
	 * @returns {Promise<void>} - A promise that resolves after the delay.
	 */
	static delay(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	/**
	 * Generates a random integer between min and max, inclusive.
	 * @param {number} min - The minimum value.
	 * @param {number} max - The maximum value.
	 * @returns {number} - The random integer.
	 */
	static randomRange(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	/**
	 * Shuffles an array using the Fisher-Yates algorithm.
	 * @param {any[]} array - The array to shuffle.
	 * @returns {any[]} - The shuffled array.
	 */
	static shuffle(array) {
		const arr = array.slice(0);
		for (let i = arr.length - 1; i >= 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const temp = arr[i];
			arr[i] = arr[j];
			arr[j] = temp;
		}
		return arr;
	}

	/**
	 * Uploads text to Hastebin and returns the URL.
	 * @param {string} text - The text to upload.
	 * @returns {Promise<string>} - The URL of the uploaded text.
	 */
	static async hastebin(text) {
		const res = await fetch('https://www.hastebin.com/documents', {
			method: 'POST',
			body: text,
			headers: { 'Content-Type': 'text/plain' },
		});
		const body = await res.json();
		return `https://www.hastebin.com/${body.key}`;
	}

	/**
	 * Splits an array into chunks of a specified size.
	 * @param {any[]} array - The array to split.
	 * @param {number} chunkSize - The size of each chunk.
	 * @returns {any[][]} - An array of chunks.
	 */
	static chunk(array, chunkSize) {
		const temp = [];
		for (let i = 0; i < array.length; i += chunkSize) {
			temp.push(array.slice(i, i + chunkSize));
		}
		return temp;
	}

	/**
	 * Converts milliseconds into a human-readable duration string.
	 * @param {number} ms - The duration in milliseconds.
	 * @returns {string} - The formatted duration string.
	 */
	static parseDur(ms) {
		let seconds = ms / 1000;
		const days = parseInt(seconds / 86400);
		seconds %= 86400;
		const hours = parseInt(seconds / 3600);
		seconds %= 3600;
		const minutes = parseInt(seconds / 60);
		seconds = parseInt(seconds % 60);

		if (days) {
			return `${days}d ${hours}h ${minutes}m ${seconds}s`;
		}
		else if (hours) {
			return `${hours}h ${minutes}m ${seconds}s`;
		}
		else if (minutes) {
			return `${minutes}m ${seconds}s`;
		}
		return `${seconds}s`;
	}

	/**
	 * Trims an array to a specified length, appending an ellipsis if trimmed.
	 * @param {any[]} array - The array to trim.
	 * @param {number} [length=10] - The maximum length of the array.
	 * @returns {any[]} - The trimmed array.
	 */
	static trimArray(array, length = 10) {
		const len = array.length - length;
		const temp = array.slice(0, length);
		temp.push(`...${len} more.`);
		return temp;
	}

	/**
	 * Adds reaction emojis to a message and waits for the user to react with "yes" or "no".
	 * @param {Object} user - The Discord user to wait for reactions from.
	 * @param {Object} msg - The Discord message to add reactions to.
	 * @param {number} [time=30000] - Time in milliseconds to wait for a reaction.
	 * @returns {Promise<boolean>} - Returns a promise that resolves to true if "yes" was reacted to, false otherwise.
	 */
	static async verify(user, msg, time = 30000) {
		await msg.react('🇾');
		await msg.react('🇳');
		const data = await msg.awaitReactions(reaction => reaction.users.has(user.id), { time, max: 1 });
		if (data.firstKey() === '🇾') return true;
		return false;
	}

	/**
	 * Formats a string as a code block for Discord messages.
	 * @param {string} code - The programming language for syntax highlighting.
	 * @param {string} string - The code or text to format.
	 * @returns {string} - The formatted code block string.
	 */
	static codeBlock(code, string) {
		return `\`\`\`${code}\n${string}\`\`\``;
	}

	/**
	 * Decodes HTML entities in a text string.
	 * @param {string} text - The text containing HTML entities.
	 * @returns {string} - The decoded text.
	 */
	static decodeHtmlEntities(text) {
		return text.replace(/&#(?:\d+);/g, (rep, code) => String.fromCharCode(code));
	}

	/**
	 * Fetches a random image from a specified subreddit on Imgur.
	 * @param {string} subreddit - The name of the subreddit.
	 * @returns {Promise<string|undefined>} - The URL of the image or undefined if failed.
	 */
	static async scrapeSubreddit(subreddit) {
		try {
			subreddit = typeof subreddit === 'string' && subreddit.length !== 0 ? subreddit : 'puppies';
			const res = await fetch(`https://imgur.com/r/${subreddit}/hot.json`);
			const body = await res.json();
			if (!body.data || !body.data.length) return undefined;
			const img = body.data[Math.floor(Math.random() * body.data.length)];
			return `http://imgur.com/${img.hash}${img.ext.replace(/\?.*/, '')}`;
		}
		catch (error) {
			console.error('Failed to fetch subreddit image:', error);
			return undefined;
		}
	}

	/**
	 * Converts a callback-based function to a promise-based function.
	 * @param {Function} fn - The function to convert.
	 * @returns {Function} - The promise-based function.
	 */
	static promisify(fn) {
		if (nodeVersion >= 8) return require('util').promisify(fn);
		let name = fn.name;
		name = (name || '').replace(/\s|bound(?!$)/g, '');
		function newFunction(...args) {
			const arg = [];
			for (const key of Object.keys(args)) arg.push(args[key]);
			// eslint-disable-next-line no-invalid-this
			return new Promise((resolve, reject) => fn.apply(this, [...args, (err, res) => {
				if (err) return reject(err);
				return resolve(res);
			}]));
		}
		Object.defineProperty(newFunction, 'name', { value: name });
		return newFunction;
	}

	/**
	 * Converts all callback-based methods on an object to promise-based methods.
	 * @param {Object} obj - The object with methods to convert.
	 * @param {string} [suffix='Async'] - The suffix to add to method names.
	 * @returns {Object} - The object with promisified methods.
	 */
	static promisifyAll(obj, suffix = 'Async') {
		const newObj = Object.getPrototypeOf(obj);
		for (const key of Object.keys(obj).concat(Object.keys(newObj))) {
			if (typeof obj[key] !== 'function') continue;
			obj[`${key}${suffix}`] = this.promisify(obj[key]);
		}
		return obj;
	}

	/**
	 * Wraps text to fit within a specified width in a canvas context.
	 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
	 * @param {string} text - The text to wrap.
	 * @param {number} maxWidth - The maximum width of the text.
	 * @returns {Promise<string[]>} - A promise that resolves to an array of wrapped text lines.
	 */
	static wrapText(ctx, text, maxWidth) {
		return new Promise(resolve => {
			if (ctx.measureText(text).width < maxWidth) return resolve([text]);
			const words = text.split(' ');
			const lines = [];
			let line = '';
			while (words.length > 0) {
				let split = false;
				while (ctx.measureText(words[0]).width >= maxWidth) {
					const temp = words[0];
					words[0] = temp.slice(0, -1);
					if (split) {
						words[1] = `${temp.slice(-1)}${words[1]}`;
					}
					else {
						split = true;
						words.splice(1, 0, temp.slice(-1));
					}
				}
				if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
					line += `${words.shift()} `;
				}
				else {
					lines.push(line.trim());
					line = '';
				}
				if (words.length === 0) lines.push(line.trim());
			}
			return resolve(lines);
		});
	}
}

module.exports = Util;
