using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class ColorFilter : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<ColorFilter>(id, nameof(ColorFilter)); 

		public static ColorFilter Resolve(string id) => Resolve<ColorFilter>(id, nameof(ColorFilter)) as ColorFilter;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<ColorFilter>();

		/// <summary>
		/// Name of coordinate display
		/// </summary>
		public abstract string Name { get; }

		public abstract void Render(HtmlTextWriter writer);
	}
}
