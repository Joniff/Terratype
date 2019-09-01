using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;
using Umbraco.Core.Composing;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class Provider : IDiscoverable
	{
		/// <summary>
		/// Id of provider
		/// </summary>
		public abstract string Id { get; }

		/// <summary>
		/// Name of provider
		/// </summary>
		public abstract string Name { get; }

		/// <summary>
		/// Description of provider
		/// </summary>
		public abstract string Description { get; }

		/// <summary>
		/// Url that a developer can use to get more information about this map provider
		/// </summary>
		public abstract string ReferenceUrl { get; }
		
		/// <summary>
		/// Coordinate systems that this map provider can handle
		/// </summary>
		public abstract IEnumerable<string> CoordinateSystems { get; }

		/// <summary>
		/// Labels that this map provider can handle
		/// </summary>
		public abstract IEnumerable<string> Labels { get; }

		/// <summary>
		/// Can this map handle searches
		/// </summary>
		public abstract bool CanSearch { get; }

		public abstract void Render(Guid key, HtmlTextWriter writer, int id, Map model, string labelId = null, int? height = null, string language = null, 
			Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript, bool AutoShowLabel = false,
			bool AutoRecenterAfterRefresh = false, bool AutoFit = false, string Tag = null);
	}
}
