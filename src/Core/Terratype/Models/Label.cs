using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class Label : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<Label>(id, nameof(Label)); 

		public static Label Resolve(string id) => Resolve<Label>(id, nameof(Label)) as Label;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<Label>();
		
		/// <summary>
		/// Name of label
		/// </summary>
		public abstract string Name { get; }

		/// <summary>
		/// Description of label
		/// </summary>
		public abstract string Description { get; }

		/// <summary>
		/// Does this map have a label that the editor can edit
		/// </summary>
		[JsonProperty(PropertyName = "enable")]
		public bool Enable { get; }

		public enum EditPositions { Below = 0, Overlay = 1};

		/// <summary>
		/// Edit position
		/// </summary>
		[JsonProperty(PropertyName = "editPosition")]
		public EditPositions EditPosition { get; }

		/// <summary>
		/// Has this lable got some content. False = The content editor has left this label blank
		/// </summary>
		public abstract bool HasContent { get; }

		public abstract void Render(Guid key, HtmlTextWriter writer, Map model);

	}
}

