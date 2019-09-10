using System;
using System.Collections.Generic;
using System.Web.UI;
using Terratype.CoordinateSystems;
using Terratype.Discover;

namespace Terratype.CoordinateDisplays
{
	public interface ICoordinateDisplay : IDiscover
	{
		IEnumerable<string> CoordinateSystems { get; }

		string Display(IPosition position);

		void Render(Guid key, HtmlTextWriter writer, IPosition startPosition, Func<Guid, IPosition, bool> updated);
	}
}
