using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class Searcher : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<Searcher>(id, nameof(Searcher)); 

		public static Searcher Resolve(string id) => Resolve<Searcher>(id, nameof(Searcher)) as Searcher;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<Searcher>();

		/// <summary>
		/// Name of searcher
		/// </summary>
		public abstract string Name { get; }

		/// <summary>
		/// Description of searcher
		/// </summary>
		public abstract string Description { get; }

		/// <summary>
		/// Url that a developer can use to get more information about this map searcher
		/// </summary>
		public abstract string ReferenceUrl { get; }

		public abstract Address ReverseGeocode(Position position);

		public abstract Address GetAddress(string addressId);

		public abstract Position GetPosition(string addressId);

		public Position GetPosition(Address address) => GetPosition(address.Id);

		public abstract IEnumerable<Position> Geocode(string searchText);

		public abstract IEnumerable<string> Autocomplete(string searchText);

		public abstract void Render(Guid key, HtmlTextWriter writer, string startText, Func<Guid, Position, bool> updated);

	}
}
