/*
 * MIT License
 *
 * Copyright (c) 2016 BotMill.io
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
package co.aurasphere.botmill.fb.event;


// TODO: Auto-generated Javadoc
/**
 * Enum that represents all the possible callbacks from Facebook's Messenger
 * Platform.
 *
 * @author Donato Rimenti
 * @author Alvin Reyes
 * @see <a href=
 *      "https://developers.facebook.com/docs/messenger-platform/webhook-reference#setup"
 *      >Facebook's Messenger Platform Callbacks Documentation</a>
 * 
 */
public enum FbBotMillEventType {
	
	/** The file. */
	FILE,
	
	/** The video. */
	VIDEO,
	
	/** The audio. */
	AUDIO,
	
	/** The image. */
	IMAGE,

	/**
	 * Represents message callback.
	 */
	MESSAGE,

	/**
	 * The message pattern.
	 */
	MESSAGE_PATTERN,

	/**
	 * The quick reply message.
	 */
	QUICK_REPLY_MESSAGE,

	/**
	 * The quick reply message pattern.
	 */
	QUICK_REPLY_MESSAGE_PATTERN,

	/**
	 * Represents messaging_postback callback.
	 */
	POSTBACK,

	/**
	 * The postback pattern.
	 */
	POSTBACK_PATTERN,

	/**
	 * Represents messaging_optins callback.
	 */
	AUTHENTICATION,

	/**
	 * Represents an account linking callback. There's no defined event for this
	 * on Messenger Platform.
	 */
	ACCOUNT_LINKING,

	/**
	 * Represents message_deliveries callback.
	 */
	DELIVERY,

	/**
	 * Represents message_reads callback.
	 */
	READ,

	/**
	 * Represents message_echoes callback.
	 */
	ECHO,

	/**
	 * Represents messaging_checkout_updates callback.
	 */
	CHECKOUT_UPDATE,

	/**
	 * Represents messaging_referral callback.
	 */
	REFERRAL,

	/**
	 * Represents messaging_payments callback.
	 */
	PAYMENT,

	/**
	 * Represents a Quick Reply location callback.
	 */
	LOCATION,

	/**
	 * Represents messaging_pre_checkouts callback.
	 */
	PRE_CHECKOUT,

	/**
	 * Represents any of the previous callbacks. Used as utility event.
	 */
	ANY;

}
