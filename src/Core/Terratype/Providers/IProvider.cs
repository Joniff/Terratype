using System;
using System.Collections.Generic;
using System.Web.UI;
using Terratype.Discover;

namespace Terratype.Providers
{
	public interface IProvider : IDiscover
	{
		/// <summary>
		/// Url that a developer can use to get more information about this map provider
		/// </summary>
		string ReferenceUrl { get; }
		
		/// <summary>
		/// Coordinate systems that this map provider can handle
		/// </summary>
		IEnumerable<string> CoordinateSystems { get; }

		/// <summary>
		/// Labels that this map provider can handle
		/// </summary>
		IEnumerable<string> Labels { get; }

		/// <summary>
		/// Can this map handle searches
		/// </summary>
		bool CanSearch { get; }

		void Render(Guid key, HtmlTextWriter writer, int id, IMap model, string labelId = null, int? height = null, string language = null, 
			Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript, bool AutoShowLabel = false,
			bool AutoRecenterAfterRefresh = false, bool AutoFit = false, string Tag = null);
	}
}
