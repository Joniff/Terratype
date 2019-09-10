using System.Diagnostics;
using System.Web.UI;
using Newtonsoft.Json;
using Terratype.Discover;

namespace Terratype.ColorFilters
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public abstract class ColorFilterBase : DiscoverBase, IColorFilter
	{
		/// <summary>
		/// Value
		/// </summary>
		public int Value { get; set; }

		public abstract void Render(HtmlTextWriter writer);

		protected int PercentageToDegree(int value) => (value * 36) / 10;
	}
}
