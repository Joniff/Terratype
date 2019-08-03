using System;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Grayscale : Models.ColorFilter
	{
		public const string _Id = "grayscale";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterGrayscale_name";
		public override string Description => "terratypeColorFilterGrayscale_description";
		
		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: grayscale(" + Value.ToString() + "%); filter: grayscale(" + Value.ToString() + "%);");
	}
}
