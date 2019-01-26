using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class CoordinateDisplay : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<CoordinateDisplay>(id, nameof(CoordinateDisplay)); 

		public static CoordinateDisplay Resolve(string id) => Resolve<CoordinateDisplay>(id, nameof(CoordinateDisplay)) as CoordinateDisplay;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<CoordinateDisplay>();

		public abstract IEnumerable<string> CoordinateSystems { get; }

		/// <summary>
		/// Name of coordinate display
		/// </summary>
		public abstract string Name { get; }

		/// <summary>
		/// Description of searcher
		/// </summary>
		public abstract string Description { get; }

		public abstract string Display(Position position);

		public abstract void Render(Guid key, HtmlTextWriter writer, Position startPosition, Func<Guid, Position, bool> updated);
	}
}
