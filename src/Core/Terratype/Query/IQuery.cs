using System;
using System.Collections.Generic;
using System.Web.UI;
using Terratype.CoordinateSystems;
using Terratype.Discover;

namespace Terratype.Query
{
	public interface IQuery : IDiscover
	{
		/// <summary>
		/// Url that a developer can use to get more information about this map searcher
		/// </summary>
		string ReferenceUrl { get; }

		Address ReverseGeocode(IPosition position);

		Address GetAddress(string addressId);

		IPosition GetPosition(string addressId);

		IPosition GetPosition(Address address);

		IEnumerable<IPosition> Geocode(string searchText);

		IEnumerable<string> Autocomplete(string searchText);

		void Render(Guid key, HtmlTextWriter writer, string startText, Func<Guid, IPosition, bool> updated);

	}
}
