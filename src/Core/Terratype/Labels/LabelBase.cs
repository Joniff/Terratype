using System;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;
using Terratype.Discover;

namespace Terratype.Labels
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class LabelBase : DiscoverBase, ILabel
	{
		/// <summary>
		/// Does this map have a label that the editor can edit
		/// </summary>
		[JsonProperty(PropertyName = "enable")]
		public bool Enable { get; }

		/// <summary>
		/// Edit position
		/// </summary>
		[JsonProperty(PropertyName = "editPosition")]
		public EditPositions EditPosition { get; }

		/// <summary>
		/// Has this lable got some content. False = The content editor has left this label blank
		/// </summary>
		public abstract bool HasContent { get; }

		public abstract void Render(Guid key, HtmlTextWriter writer, IMap model);

	}
}

