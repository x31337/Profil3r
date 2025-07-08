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
package co.aurasphere.botmill.fb;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import co.aurasphere.botmill.core.BotDefinition;
import co.aurasphere.botmill.core.base.BotMillServlet;
import co.aurasphere.botmill.fb.internal.util.json.FbBotMillJsonUtils;
import co.aurasphere.botmill.fb.internal.util.network.FbBotMillNetworkConstants;
import co.aurasphere.botmill.fb.model.incoming.MessageEnvelope;
import co.aurasphere.botmill.fb.model.incoming.MessengerCallback;
import co.aurasphere.botmill.fb.model.incoming.MessengerCallbackEntry;
import co.aurasphere.botmill.fb.model.incoming.handler.IncomingToOutgoingMessageHandler;


/**
 * Main Servlet for FbBotMill framework. This servlet requires an init-param
 * containing the fully qualified name of a class implementing
 * {@link BotDefinition} in which the initial configuration is done. If not such
 * class is found or can't be loaded, a ServletException is thrown during
 * initialization.
 * 
 * The FbBotMillServlet supports GET requests only for the Subscribing phase and
 * POST requests for all the Facebook callbacks. For more information about how
 * the communication is handled, check the documentation for {@link #doGet},
 * {@link #doPost(HttpServletRequest, HttpServletResponse)} and Facebook's
 * documentation with the link below.
 *
 * @author Donato Rimenti
 * @author Alvin Reyes
 * 
 * @see <a href=
 *      "https://developers.facebook.com/docs/messenger-platform/quickstart">
 *      Facebook Subscription info</a>
 * 
 */
public class FbBotMillServlet extends BotMillServlet {

	/**
	 * The logger.
	 */
	private static final Logger logger = LoggerFactory
			.getLogger(FbBotMillServlet.class);

	/**
	 * The serial version UID.
	 */
	private static final long serialVersionUID = 1L;
	

	/**
	 * Specifies how to handle a GET request. GET requests are used by Facebook
	 * only during the WebHook registration. During this phase, the
	 * FbBotMillServlet checks that the
	 * {@link FbBotMillNetworkConstants#HUB_MODE_PARAMETER} value received
	 * equals to {@link FbBotMillNetworkConstants#HUB_MODE_SUBSCRIBE} and that
	 * the {@link FbBotMillNetworkConstants#HUB_VERIFY_TOKEN_PARAMETER} value
	 * received equals to the {@link FbBotMillContext#getValidationToken()}. If
	 * that's true, then the FbBotMillServlet will reply sending back the value
	 * of the {@link FbBotMillNetworkConstants#HUB_CHALLENGE_PARAMETER}
	 * received, in order to confirm the registration, otherwise it will return
	 * an error 403.
	 *
	 * @param req
	 *            the req
	 * @param resp
	 *            the resp
	 * @throws ServletException
	 *             the servlet exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	@Override
	@SuppressWarnings("unchecked")
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		// Retrieves GET parameters.
		String validationToken = FbBotMillContext.getInstance()
				.getValidationToken();
		Map<String, String[]> parameters = req.getParameterMap();
		String hubMode = safeUnwrapGetParameters(parameters
				.get(FbBotMillNetworkConstants.HUB_MODE_PARAMETER));
		String hubToken = safeUnwrapGetParameters(parameters
				.get(FbBotMillNetworkConstants.HUB_VERIFY_TOKEN_PARAMETER));
		String hubChallenge = safeUnwrapGetParameters(parameters
				.get(FbBotMillNetworkConstants.HUB_CHALLENGE_PARAMETER));

		// Checks parameters and responds according to that.
		if (hubMode.equals(FbBotMillNetworkConstants.HUB_MODE_SUBSCRIBE)
				&& hubToken.equals(validationToken)) {
			logger.info("Subscription OK.");
			resp.setStatus(200);
			resp.setContentType("text/plain");
			resp.getWriter().write(hubChallenge);
		} else {
			logger.warn("GET received is not a subscription or wrong validation token. Ensure you have set the correct validation token using FbBotMillContext.getInstance().setup(String, String).");
			resp.sendError(403);
		}
	}

	/**
	 * Specifies how to handle a POST request. It parses the request as a
	 * {@link MessengerCallback} object. If the request is not a
	 * MessengerCallback, then the FbBotMillServlet logs an error and does
	 * nothing, otherwise it will forward the request to all registered bots in
	 * order to let them process the callbacks.
	 *
	 * @param req
	 *            the req
	 * @param resp
	 *            the resp
	 * @throws ServletException
	 *             the servlet exception
	 * @throws IOException
	 *             Signals that an I/O exception has occurred.
	 */
	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
			throws ServletException, IOException {

		logger.trace("POST received!");
		MessengerCallback callback = new MessengerCallback();

		// Extrapolates and logs the JSON for debugging.
		String json = readerToString(req.getReader());
		logger.debug("JSON input: " + json);

		// Parses the request as a MessengerCallback.
		try {
			callback = FbBotMillJsonUtils.fromJson(json, MessengerCallback.class);
		} catch (Exception e) {
			logger.error("Error during MessengerCallback parsing: ", e);
			return;
		}

		// If the received POST is a MessengerCallback, it forwards the last
		// envelope of all the callbacks received to the registered bots.
		if (callback != null) {
			List<MessengerCallbackEntry> callbackEntries = callback.getEntry();
			if (callbackEntries != null) {
				for (MessengerCallbackEntry entry : callbackEntries) {
					List<MessageEnvelope> envelopes = entry.getMessaging();
					if (envelopes != null) {
						MessageEnvelope lastEnvelope = envelopes.get(envelopes.size() - 1);
						IncomingToOutgoingMessageHandler.getInstance().process(lastEnvelope);
					}
				}
			}
		}
		// Always set to ok.
		resp.setStatus(HttpServletResponse.SC_OK);
	}

	/**
	 * Method which returns the first String in a String array if present or the
	 * empty String otherwise. Used to unwrap the GET arguments from an
	 * {@link HttpServletRequest#getParameterMap()} which returns a String array
	 * for each GET parameter.
	 * 
	 * @param parameter
	 *            the String array to unwrap.
	 * @return the first String of the array if found or the empty String
	 *         otherwise.
	 */
	private static String safeUnwrapGetParameters(String[] parameter) {
		if (parameter == null || parameter[0] == null) {
			return "";
		}
		return parameter[0];
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "FbBotMillServlet []";
	}

}