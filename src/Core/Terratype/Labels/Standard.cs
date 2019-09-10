using Newtonsoft.Json;
using System;
using System.Diagnostics;
using System.Web;
using System.Web.UI;

namespace Terratype.Labels
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public class Standard : LabelBase
	{
		public const string _Id = "standard";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeLabelStandard_name";                    //  Value is in the language file
		public override string Description => "terratypeLabelStandard_description";                    //  Value is in the language file

		[JsonProperty(PropertyName = "foreground")]
		public int Foreground { get; set; }

		[JsonProperty(PropertyName = "background")]
		public int Background { get; set; }

		[JsonConverter(typeof(IHtmlStringConverter))]
		[JsonProperty(PropertyName = "content")]
		public IHtmlString Content { get; set; }

		public override bool HasContent => !String.IsNullOrWhiteSpace(Content.ToString());

		public override void Render(Guid Key, HtmlTextWriter writer, IMap model) => writer.Write(this.Content.ToString());
	}
}
