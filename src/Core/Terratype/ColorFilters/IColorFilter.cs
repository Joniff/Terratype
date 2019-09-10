using System.Web.UI;
using Terratype.Discover;

namespace Terratype.ColorFilters
{
	public interface IColorFilter : IDiscover
	{
		/// <summary>
		/// Value
		/// </summary>
		int Value { get; set; }

		void Render(HtmlTextWriter writer);

	}
}
