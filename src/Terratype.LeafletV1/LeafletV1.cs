using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;

namespace Terratype.Providers
{
    [JsonObject(MemberSerialization.OptIn)]
    public class LeafletV1 : Models.Provider
    {
        private string UrlPath(string file, bool cache = true)
        {
            var result = "/App_Plugins/Terratype.LeafletV1/" + file;
            if (cache)
            {
                result += "?cache=1.0.7";
            }
            return result;
        }

        [JsonProperty(PropertyName = "id")]
        public override string Id
        {
            get
            {
                return "Terratype.LeafletV1";
            }
        }

        public override string Name
        {
            get
            {
                return "terratypeLeafletV1_name";                   //  Value in language file
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeLeafletV1_description";            //  Value in language file
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "terratypeLeafletV1_referenceUrl";            //  Value in language file
            }
        }
        public override IDictionary<string, Type> CoordinateSystems
        {
            get
            {
                var wgs84 = new CoordinateSystems.Wgs84();
                var gcj02 = new CoordinateSystems.Gcj02();

                return new Dictionary<string, Type>
                {
                    { wgs84.Id, wgs84.GetType() },
                    { gcj02.Id, gcj02.GetType() }
                };
            }
        }

        [JsonObject(MemberSerialization.OptIn)]
        public class MapSourceDefinition
        {
            [JsonObject(MemberSerialization.OptIn)]
            public class TileServerDefinition
            {
                [JsonProperty(PropertyName = "id")]
                public string Id { get; set; }
            }

            [JsonProperty(PropertyName = "tileServer")]
            public TileServerDefinition TileServer { get; set; }

            [JsonProperty(PropertyName = "minZoom")]
            public int MinZoom { get; set; }

            [JsonProperty(PropertyName = "maxZoom")]
            public int MaxZoom { get; set; }
        }

        [JsonProperty(PropertyName = "mapSources")]
        public IEnumerable<MapSourceDefinition> MapSources { get; set; }

        public enum ControlPositions
        {
            TopLeft = 1,
            TopRight = 3,
            BottomLeft = 10,
            BottomRight = 12
        }

        [JsonObject(MemberSerialization.OptIn)]
        public class ZoomControlDefinition
        {
            [JsonProperty(PropertyName = "enable")]
            public bool Enable { get; set; }

            [JsonProperty(PropertyName = "position")]
            public ControlPositions Position { get; set; }
        }

        [JsonProperty(PropertyName = "zoomControl")]
        public ZoomControlDefinition ZoomControl { get; set; }


        public override void GetHtml(HtmlTextWriter writer, int mapId, Models.Model model, string labelId = null, int? height = null, string language = null)
        {
            const string guid = "53031a3b-dc6a-4440-a5e5-5060f691afd6";
            var id = nameof(Terratype) + "." + nameof(LeafletV1) + Guid.NewGuid().ToString();

            writer.AddAttribute("data-css-files", HttpUtility.UrlEncode(JsonConvert.SerializeObject(new string[] 
            {
                UrlPath("css/leaflet.css"),
                UrlPath("css/markercluster.css")
            }), System.Text.Encoding.Default));
            writer.AddAttribute("data-leafletv1", HttpUtility.UrlEncode(JsonConvert.SerializeObject(model), System.Text.Encoding.Default));
            writer.AddAttribute("data-map-id", "m" + mapId.ToString());
            if (labelId != null)
            {
                writer.AddAttribute("data-label-id", labelId);
            }
            writer.AddAttribute("data-id", id);
            writer.AddStyleAttribute(HtmlTextWriterStyle.Display, "none");
            writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype) + '.' + nameof(LeafletV1));
            writer.RenderBeginTag(HtmlTextWriterTag.Div);

            if (model.Icon != null && !HttpContext.Current.Items.Contains(guid))
            {
                HttpContext.Current.Items.Add(guid, true);
                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/Terratype.Renderer.js"));
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();

                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/leaflet.js"));
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();

                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/leaflet.markercluster.js"));
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();

                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/tileservers.js"));
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();
            }

            writer.AddAttribute(HtmlTextWriterAttribute.Id, id);
            writer.AddStyleAttribute(HtmlTextWriterStyle.Height, (height != null ? height : model.Height).ToString() + "px");
            writer.RenderBeginTag(HtmlTextWriterTag.Div);
            writer.RenderEndTag();
            writer.RenderEndTag();
        }

    }
}
