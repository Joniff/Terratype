using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;
using Terratype.CoordinateSystems;
using Terratype.Discover;

namespace Terratype.CoordinateDisplays
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class CoordinateDisplay : DiscoverBase, ICoordinateDisplay
	{
		public abstract IEnumerable<string> CoordinateSystems { get; }

		public abstract string Display(IPosition position);

		public abstract void Render(Guid key, HtmlTextWriter writer, IPosition startPosition, Func<Guid, IPosition, bool> updated);
	}
}
