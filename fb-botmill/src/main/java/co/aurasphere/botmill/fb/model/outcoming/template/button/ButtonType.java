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
package co.aurasphere.botmill.fb.model.outcoming.template.button;

import com.google.gson.annotations.SerializedName;


/**
 * The Enum for WebViewHeightRatioType.
 *
 * @author Alvin Reyes
 * 
 */
public enum ButtonType {

	/** The web url. */
	@SerializedName("web_url")
	WEB_URL,
	
	/** The postback. */
	@SerializedName("postback")
	POSTBACK,
	
	/** The phone number. */
	@SerializedName("phone_number")
	PHONE_NUMBER,
	
	/** The element share. */
	@SerializedName("element_share")
	ELEMENT_SHARE,

	/** The account link. */
	@SerializedName("account_link")
	ACCOUNT_LINK,
	
	/** The account unlink. */
	@SerializedName("account_unlink")
	ACCOUNT_UNLINK,
	
	/** The payment. */
	@SerializedName("payment")
	PAYMENT,
	
	/** The nested. */
	@SerializedName("nested")
	NESTED;

}
