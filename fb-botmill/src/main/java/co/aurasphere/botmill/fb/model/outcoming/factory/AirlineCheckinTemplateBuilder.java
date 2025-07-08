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
package co.aurasphere.botmill.fb.model.outcoming.factory;

import co.aurasphere.botmill.fb.model.base.AttachmentType;
import co.aurasphere.botmill.fb.model.incoming.MessageEnvelope;
import co.aurasphere.botmill.fb.model.outcoming.FbBotMillResponse;
import co.aurasphere.botmill.fb.model.outcoming.payload.template.airline.AirlineCheckinTemplatePayload;
import co.aurasphere.botmill.fb.model.outcoming.quickreply.QuickReply;
import co.aurasphere.botmill.fb.model.outcoming.template.airline.FlightInfo;


/**
 * A builder for an Airline Checkin Template.
 *
 * @author Donato Rimenti
 * @see <a href=
 *      "https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-checkin-template"
 *      > Facebook's Messenger Platform Airline Checkin Template
 *      Documentation</a>
 * 
 */
public class AirlineCheckinTemplateBuilder extends FlightInfoBuilderDelegator {

	/**
	 * The payload managed by this builder.
	 */
	private AirlineCheckinTemplatePayload payload;

	/**
	 * Default constructor. Creates a builder for an Airline Flight Update
	 * Template.
	 *
	 * @param introMessage
	 *            the message to send before the template. Can't be empty.
	 * @param locale
	 *            the current locale. Can't be empty and must be in format
	 *            [a-z]{2}_[A-Z]{2}. Locale must be in format [a-z]{2}_[A-Z]{2}.
	 *            For more information see<a href=
	 *            "https://developers.facebook.com/docs/internationalization#locales"
	 *            > Facebook's locale support</a>. param pnrNumber the Passenger
	 *            Name Record number (Booking Number). It can't be empty.
	 * @param pnrNumber
	 *            the pnr number
	 * @param checkinUrl
	 *            the URL for passengers to check-in. It can't be empty.
	 * @see <a href=
	 *      "https://developers.facebook.com/docs/messenger-platform/send-api-reference/airline-checkin-template"
	 *      > Facebook's Messenger Platform Airline Checkin Template
	 *      Documentation</a>
	 */
	AirlineCheckinTemplateBuilder(String introMessage, String locale,
			String pnrNumber, String checkinUrl) {
		this.payload = new AirlineCheckinTemplatePayload(introMessage, locale,
				pnrNumber, checkinUrl);
		this.messageBuilder = new AttachmentMessageBuilder(
				AttachmentType.TEMPLATE, this.payload);
	}

	/**
	 * Adds a {@link FlightInfo} object to this template. This object is
	 * mandatory and can't be null for Airline templates. There can be multiple
	 * flight info object but there must be at least one.
	 * 
	 * @param flightNumber
	 *            the flight number. It can't be empty.
	 * @return a builder for the {@link FlightInfo} object.
	 */
	public FlightInfoBuilder<AirlineCheckinTemplateBuilder> addFlightInfo(
			String flightNumber) {
		return new FlightInfoBuilder<AirlineCheckinTemplateBuilder>(this,
				flightNumber);
	}

	/**
	 * Adds a {@link FlightInfo} object to this template. This object is
	 * mandatory and can't be null for Airline templates. There can be multiple
	 * flight info object but there must be at least one. Used only by delegated
	 * classes. Should not be called directly. Use
	 * {@link #addFlightInfo(String)} instead.
	 * 
	 * @param flightInfo
	 *            the flight info to add. It can't be null.
	 */
	@Override
	void addFlightInfo(FlightInfo flightInfo) {
		this.payload.addFlightInfo(flightInfo);
	}

	/**
	 * Sets the theme color for this template. This field is optional. If not
	 * specified, the template will use Facebook's default theme (light blue).
	 * 
	 * @param themeColor
	 *            the color for this template. The Color must be a valid RGB
	 *            color in the format #RRGGBB.
	 * 
	 * @return this builder.
	 */
	public AirlineCheckinTemplateBuilder setThemeColor(String themeColor) {
		this.payload.setThemeColor(themeColor);
		return this;
	}

	/**
	 * Adds a {@link QuickReply} to the current object.
	 *
	 * @param title
	 *            the quick reply button label. It can't be empty.
	 * @param payload
	 *            the payload sent back when the button is pressed. It can't be
	 *            empty.
	 * @return this builder.
	 * @see <a href=
	 *      "https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies"
	 *      > Facebook's Messenger Platform Quick Replies Documentation</a>
	 */
	public AirlineCheckinTemplateBuilder addQuickReply(String title,
			String payload) {
		this.messageBuilder.addQuickReply(title, payload);
		return this;
	}

	/**
	 * Adds a {@link QuickReply} to the current object.
	 *
	 * @param reply
	 *            a quick reply object.
	 * @return this builder.
	 * @see <a href=
	 *      "https://developers.facebook.com/docs/messenger-platform/send-api-reference/quick-replies"
	 *      > Facebook's Messenger Platform Quick Replies Documentation</a>
	 */
	public AirlineCheckinTemplateBuilder addQuickReply(QuickReply reply) {
		this.messageBuilder.addQuickReply(reply);
		return this;
	}

	/**
	 * Builds the {@link FbBotMillResponse} that the bot should return. The
	 * template builders, like this, delegate an
	 * {@link AttachmentMessageBuilder} to build the message.
	 * 
	 * @param envelope
	 *            a {@link MessageEnvelope} object representing the incoming
	 *            message.
	 * @return the {@link FbBotMillResponse} of this bot.
	 */
	@Override
	public FbBotMillResponse build(MessageEnvelope envelope) {
		return this.messageBuilder.build(envelope);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * co.aurasphere.botmill.fb.model.outcoming.factory.AirlineBaseTemplateBuilder
	 * #toString()
	 */
	@Override
	public String toString() {
		return "AirlineCheckinTemplateBuilder [payload=" + payload
				+ ", messageBuilder=" + messageBuilder + "]";
	}

}
