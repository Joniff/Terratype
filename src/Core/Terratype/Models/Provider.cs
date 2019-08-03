using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class Provider : Plugins.Resolver
	{
		public static Type ResolveType(string id) => ResolveType<Provider>(id, nameof(Provider)); 

		public static Provider Resolve(string id) => Resolve<Provider>(id, nameof(Provider)) as Provider;

		public static IEnumerable<string> InstalledTypes => InstalledTypes<Provider>();

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
		public abstract IEnumerable<Label> Labels { get; }

		/// <summary>
		/// Can this map handle searches
		/// </summary>
		public abstract bool CanSearch { get; }

		public abstract void Render(Guid key, HtmlTextWriter writer, int id, Models.Model model, string labelId = null, int? height = null, string language = null, 
			Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript, bool AutoShowLabel = false,
			bool AutoRecenterAfterRefresh = false, bool AutoFit = false, string Tag = null);
	}
}
