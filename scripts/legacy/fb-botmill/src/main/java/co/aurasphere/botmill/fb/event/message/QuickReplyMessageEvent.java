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
package co.aurasphere.botmill.fb.event.message;

import co.aurasphere.botmill.fb.event.FbBotMillEvent;
import co.aurasphere.botmill.fb.event.base.BaseStringEvent;
import co.aurasphere.botmill.fb.model.incoming.MessageEnvelope;


/**
 * An {@link FbBotMillEvent} that processes all the incoming callbacks that
 * contains a specific text message from Facebook's Messenger Platform.
 * 
 * @author Alvin Reyes
 */
public class QuickReplyMessageEvent extends BaseStringEvent {

	/**
	 * Instantiates a new quick reply message event.
	 *
	 * @param expectedPayload
	 *            the expected payload
	 * @param caseSensitive
	 *            the case sensitive
	 */
	public QuickReplyMessageEvent(String expectedPayload, boolean caseSensitive) {
		super(expectedPayload, caseSensitive);
	}

	/**
	 * Instantiates a new quick reply message event.
	 *
	 * @param expectedPayload
	 *            the expected payload
	 */
	public QuickReplyMessageEvent(String expectedPayload) {
		super(expectedPayload);
	}

	/**
	 * Verify event condition.
	 *
	 * @param envelope
	 *            the envelope
	 * @return true if the text message received by the callback equals the
	 *         expected message, false otherwise.
	 */
	public final boolean verifyEventCondition(MessageEnvelope envelope) {
		String message = safeGetQuickReplyPayload(envelope);
		if (caseSensitive) {
			expectedString = expectedString.toLowerCase();
			message = message.toLowerCase();
		}
		return message.equals(expectedString);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see co.aurasphere.botmill.fb.event.base.BaseStringEvent#toString()
	 */
	@Override
	public String toString() {
		return "QuickReplyMessageEvent [expectedString=" + expectedString + "]";
	}

}
