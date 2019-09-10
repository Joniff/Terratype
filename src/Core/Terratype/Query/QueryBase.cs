using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;
using Terratype.CoordinateSystems;
using Terratype.Discover;

namespace Terratype.Query
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class QueryBase : DiscoverBase, IQuery
	{
		/// <summary>
		/// Url that a developer can use to get more information about this map searcher
		/// </summary>
		public abstract string ReferenceUrl { get; }

		public abstract Address ReverseGeocode(IPosition position);

		public abstract Address GetAddress(string addressId);

		public abstract IPosition GetPosition(string addressId);

		public IPosition GetPosition(Address address) => GetPosition(address.Id);

		public abstract IEnumerable<IPosition> Geocode(string searchText);

		public abstract IEnumerable<string> Autocomplete(string searchText);

		public abstract void Render(Guid key, HtmlTextWriter writer, string startText, Func<Guid, IPosition, bool> updated);

	}
}
