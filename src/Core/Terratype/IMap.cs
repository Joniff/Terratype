using System.Collections.Generic;
using Newtonsoft.Json;
using Terratype.ColorFilters;
using Terratype.CoordinateDisplays;
using Terratype.CoordinateSystems;
using Terratype.Icons;
using Terratype.Labels;
using Terratype.Providers;
using Terratype.Query;

namespace Terratype
{
	public interface IMap
	{
		/// <summary>
		/// Which display coordinate system is this map using to render
		/// </summary>
		ICoordinateDisplay CoordinateDisplay { get; }

		/// <summary>
		/// Which provider is this map using to render
		/// </summary>
		IProvider Provider { get; }

		/// <summary>
		/// Where is this map pointing to
		/// </summary>
		IPosition Position { get; set; }

		/// <summary>
		/// Image marker to display this location on the map
		/// </summary>
		Icon Icon { get; }

		/// <summary>
		/// Current map zoom
		/// </summary>
		int Zoom { get; set; }

		int Height { get; set; }

		/// <summary>
		/// Last search request, might not match current position
		/// </summary>
		string SearchText { get; set; }

		/// <summary>
		/// Last search address, might not match current position
		/// </summary>
		Address Address { get; }

		/// <summary>
		/// Label
		/// </summary>
		ILabel Label { get; set; }

		/// <summary>
		/// Color filters appied to map
		/// </summary>
		IEnumerable<IColorFilter> ColorFilters { get; set; }

	}
}
