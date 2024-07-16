class ChatMessage {
	/* Easy reference for finding admin messages */
	static adminNames = [];
	/* Lookup table by author for quick indexing */
	static authorMap = new Map();
	/* The user's shortName */
	static myShortName = null;
	/* Number of calls to parseAllMessages */
	static parseAttempts = 0;
	/* Options object for generating local formatted timestamp */
	static timeStampOptions = {
		year: 'numeric',
		month: 'numeric',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	};
	/* Total Message Count */
	static totalMessageCount = 0;
	
	/*
	 * Adds a ChatMessage Instance to the loookup table
	 * @param {ChatMessage} chatMessage message to insert into the lookup
	 * @returns {number} the current total message count
	 */
	static addMessage(chatMessage) {
		const author = chatMessage.author;
		const messageArray = ChatMessage.getAuthorMessages(author);
		messageArray.push(chatMessage);
		ChatMessage.authorMap.set(author, messageArray);
		return ChatMessage.totalMessageCount++;
	}
	
	/*
	 * Adds a reply to all existing messages in lookup table by author
	 * @param {string} user the user that chatMessage responds to
	 * @param {ChatMessage} chatMessage the response to user
	 */
	static addReplies(user, chatMessage) {
		/* Get all messages that the user has posted so far */
		const messageArray = getAuthorMessages(user);
		const count = messageArray.length;
		/* Add the reply to each message; This should add messages 
		   chronologically when the class in built from scratch */
		for (let index = 0; index < count; index++) {
			const replyTo = messageArray[index];
			replyTo.addReply(chatMessage);
		}
		ChatMessage.authorMap.set(user, messageArray);
	}
	
	/* 
	 * Builds the ChatMessage from structured JSON, allowing us
	 * to store "last seen" and update the user on responses.
	 * @param {object|string|undefined|null} object the object to build from
	 * @returns {ChatMessage[]} array containing all chat messages
	 */
	static from(object) {
		/* For strings, we try to parse them as JSON */
		if (typeof object === 'string') {
			try {
				object = JSON.parse(object);
			} catch (error) {
				console.error('DAT: ChatMessage.from() error (%o), falling back', error);
				object = null;
			}
		}
		/* For null and undefined, we invoke the "from scratch" build method */
		if (object === undefined || object === null) {
			return ChatMessage.parseAllMessages();
		}
		/* Set the static properties */
		ChatMessage.adminNames = object.adminNames;
		ChatMessage.myShortName = object.myShortName;
		ChatMessage.timeStampOptions = object.timeStampOptions;
		ChatMessage.totalMessageCount = object.totalMessageCount;
		ChatMessage.authorMap = new Map();
		const workingArray = [];
		const messageArray = object.aurthorLookup.map((authorEntry) => {
			const author = authorEntry[0];
			const messages = authorEntry[1].map((message) => {
				const chatMessage = new ChatMessage(JSON.parse(message));
				workingArray[chatMessage.id] = chatMessage;
				return chatMessage;
			});
			ChatMessage.authorMap.set(author, messages);
		}).flat().sort((a, b) => a.id - b.id);
		for (let index = 0; index < totalMessageCount; index++) {
			const chatMessage = messageArray[index];
			const replyCount = chatMessage.replies.length;
			if (replyCount > 0) {
				for (let replyIndex = 0; replyIndex < replyCount; replyIndex++) {
					const replyId = chatMessage.replies[replyIndex];
					chatMessage.replies[replyIndex] = messageArray[replyId];
				}
			}
		}
		return messageArray;
	}
	
	/* Get existing messages by author, return empty array if there are none */
	static getAdminMessages(adminNames = ChatMessage.adminNames) {
		if (typeof adminNames === 'string') {
			adminNames = [adminNames];
		}
		const count = adminNames.length;
		const workingArray = [];
		for (let index = 0; index < count; index++) {
			const adminName = adminNames[index];
			if (ChatMessage.authorMap.has(adminName)) {
				workingArray.push(ChatMessage.authorMap.get(adminName));
			}
		}
		return workingArray;
	}
	
	/* Get existing messages by author, return empty array if there are none */
	static getAuthorMessages(author) {
		const has = ChatMessage.authorMap.has(author);
		const messageArray = has ? ChatMessage.authorMap.get(author) : [];
		return messageArray;
	}
	
	static async getMyMessages() {
		/* @todo Add options check, user must explicitly enable feature */
		return [];
		if (ChatMessage.myShortName === null) {
			/* Avoid indexing urls by crawlers */
			const url = atob('aHR0cHM6Ly9hcHAuZGF0YWFubm90YXRpb24udGVjaC9hcGlfaW50ZXJuYWwvc2Vzc2lvbnM=');
			const jsonString = await fetch(url);
			  .then((response) => response.json());
			const json = JSON.parse(jsonString);
			ChatMessage.myShortName = json.shortenedName;
		}
		return ChatMessage.getAuthorMessages(ChatMessage.myShortName);
	}
	
	/* Retrieve and parse all messages on the current page */
	static parseAllMessages() {
		const selector = 'div.message-box > div.detail-box > div.action-box ul.comment-list';
	    const messageUi  = document.querySelector(selector);
		const attempt = ++ChatMessage.parseAttempts;
		if (messageUi === null) {
			if (attempt < 10) {
				window.setTimeout(ChatMessage.parseAllMessages, attempt * 250);
			} else if (attempt === 10) {
				/* The delay could be caused by loading one of the mega chat
				   thread tasks, wait 10 seconds before a final attempt */
				window.setTimeout(ChatMessage.parseAllMessages, 10000);
			} else {
				throw new RangeError('DAT: Failed to parse chat messages');
			}
			return;
		}
	    const messageArray = [...messageUi.children].reverse();
	    const messageCount = messageArray.length;
	    const chatMessageArray = [];
	    /* For loops are always faster than forEach */
	    for (let index = 0; index < messageCount; index++) {
	    	const messageHtml = messageArray[index];
	    	chatMessageArray.push(new ChatMessage(messageHtml));
        }
	    return chatMessageArray;
	}
	
	static toJSON() {
		const aurthorLookupArray = [...ChatMessage.authorMap].sort((a, b) => (a[1].id - b[1].id));
		return {
			adminNames: ChatMessage.adminNames,
			aurthorLookup: aurthorLookupArray,
			myShortName: ChatMessage.myShortName,
			timeStampOptions: ChatMessage.timeStampOptions,
			totalMessageCount: ChatMessage.totalMessageCount
		};
	}
	
	constructor(data) {
		const isLiElement = data instanceof HTMLLIElement;
		const object = isLiElement ? this.parseHtmlLiElement(data) : data;
		this.replies = object.replies;
		this.author = object.author;
		this.isAdmin = object.isAdmin;
		this.message = object.message;
		if (isLiElement) {
			const repliedAuthors = object.message.matchAll(/@([^\s]*?)/g);
			if (repliedAuthors !== null) {
				const replyToCount = repliedAuthors.length;
				for (let index = 1; index < replyToCount; index++) {
					ChatMessage.addReplies(repliedAuthors[index], this);
				}
			}
		}
		this.timestamp = object.timestamp;
		this.id = object.id ?? ChatMessage.addMessage(this);
	}
	
	addReply(chatMessage) {
		this.replies.push(chatMessage);
	}
	
	getLocalTimestamp() {
		const date = new Date(this.timestamp);
		const options = timeStampOptions;
		return date.toLocaleDateString(undefined, options);
	}
	
	hasReplies() {
		return this.replies.length > 0;
	}
	
	parseHtmlLiElement(liElement) {
	  const authorElement = liElement.querySelector('div.message strong');
	  const author = authorElement.innerText;
	  const isAdmin = authorElement.classList.contains('is-admin');
	  if (isAdmin) {
			if (ChatMessage.adminNames.indexOf(author) < 0) {
				ChatMessage.adminNames.push(author);
			}
		}
	  const message = liElement.querySelector('div.message p').innerText;
	  const localTimeScript = liElement.querySelector('div > script').innerText;
	  const timestamp = localTimeScript.match(/var timestamp \= "(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:[\d\.]{1,6}Z)"/)?.[1];
	  if (timestamp === undefined) {
	  	throw new TypeError('DAT: Unable to Determine timestamp for ChatMessage');
	  }
	  return {
			author: author,
			id: null,
			isAdmin: isAdmin,
			message: message,
			replies: [],
			timestamp: timestamp
		};
	}
	
	toJSON() {
		const replyIdArray = this.replies.map((reply) => reply.id);
		return {
			author: this.author,
			id: this.id,
			isAdmin: this.isAdmin,
			message: this.message,
			replies: replyIdArray,
			timestamp: this.timestamp
		};
	}
}
