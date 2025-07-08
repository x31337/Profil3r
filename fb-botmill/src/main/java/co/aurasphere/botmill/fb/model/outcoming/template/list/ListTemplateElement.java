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
package co.aurasphere.botmill.fb.model.outcoming.template.list;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.NotBlank;

import co.aurasphere.botmill.fb.model.outcoming.template.button.Button;

import com.google.gson.annotations.SerializedName;


/**
 * The Class ListTemplateElement.
 * 
 * @author Alvin Reyes
 * 
 * 
 */
public class ListTemplateElement implements Serializable {

	/** The Constant serialVersionUID. */
	private static final long serialVersionUID = 1L;

	/** The title. */
	@Size(max = 80)
	@NotBlank
	private String title;

	/** The image url. */
	@SerializedName("image_url")
	private String imageUrl;

	/** The subtitle. */
	@Size(max = 80)
	private String subtitle;

	/** The buttons. */
	@Valid
	@Size(max = 3)
	private List<Button> buttons;

	/** The default action. */
	@SerializedName("default_action")
	private DefaultAction defaultAction;

	/**
	 * Gets the default action.
	 *
	 * @return the default action
	 */
	public DefaultAction getDefaultAction() {
		return defaultAction;
	}

	/**
	 * Sets the default action.
	 *
	 * @param defaultAction
	 *            the new default action
	 */
	public void setDefaultAction(DefaultAction defaultAction) {
		this.defaultAction = defaultAction;
	}

	/**
	 * Instantiates a new list template element.
	 *
	 * @param title
	 *            the title
	 */
	public ListTemplateElement(String title) {
		this.title = title;
		this.buttons = new ArrayList<Button>();
	}

	/**
	 * Gets the title.
	 *
	 * @return the title
	 */
	public String getTitle() {
		return title;
	}

	/**
	 * Sets the title.
	 *
	 * @param title
	 *            the new title
	 */
	public void setTitle(String title) {
		this.title = title;
	}

	/**
	 * Gets the image url.
	 *
	 * @return the image url
	 */
	public String getImageUrl() {
		return imageUrl;
	}

	/**
	 * Sets the image url.
	 *
	 * @param imageUrl
	 *            the new image url
	 */
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	/**
	 * Gets the subtitle.
	 *
	 * @return the subtitle
	 */
	public String getSubtitle() {
		return subtitle;
	}

	/**
	 * Sets the subtitle.
	 *
	 * @param subtitle
	 *            the new subtitle
	 */
	public void setSubtitle(String subtitle) {
		this.subtitle = subtitle;
	}

	/**
	 * Gets the buttons.
	 *
	 * @return the buttons
	 */
	public List<Button> getButtons() {
		return buttons;
	}

	/**
	 * Sets the buttons.
	 *
	 * @param buttons
	 *            the new buttons
	 */
	public void setButtons(List<Button> buttons) {
		this.buttons = buttons;
	}

	/**
	 * Adds the button.
	 *
	 * @param button
	 *            the button
	 */
	public void addButton(Button button) {
		this.buttons.add(button);
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((buttons == null) ? 0 : buttons.hashCode());
		result = prime * result
				+ ((defaultAction == null) ? 0 : defaultAction.hashCode());
		result = prime * result
				+ ((imageUrl == null) ? 0 : imageUrl.hashCode());
		result = prime * result
				+ ((subtitle == null) ? 0 : subtitle.hashCode());
		result = prime * result + ((title == null) ? 0 : title.hashCode());
		return result;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		ListTemplateElement other = (ListTemplateElement) obj;
		if (buttons == null) {
			if (other.buttons != null)
				return false;
		} else if (!buttons.equals(other.buttons))
			return false;
		if (defaultAction == null) {
			if (other.defaultAction != null)
				return false;
		} else if (!defaultAction.equals(other.defaultAction))
			return false;
		if (imageUrl == null) {
			if (other.imageUrl != null)
				return false;
		} else if (!imageUrl.equals(other.imageUrl))
			return false;
		if (subtitle == null) {
			if (other.subtitle != null)
				return false;
		} else if (!subtitle.equals(other.subtitle))
			return false;
		if (title == null) {
			if (other.title != null)
				return false;
		} else if (!title.equals(other.title))
			return false;
		return true;
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "ListTemplateElement [title=" + title + ", imageUrl=" + imageUrl
				+ ", subtitle=" + subtitle + ", buttons=" + buttons
				+ ", defaultAction=" + defaultAction + "]";
	}
}
