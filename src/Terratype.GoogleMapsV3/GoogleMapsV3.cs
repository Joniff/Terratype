using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace Terratype.Providers
{
    [JsonObject(MemberSerialization.OptIn)]
    public class GoogleMapsV3 : Models.Provider
    {
        private const string UrlPath = "/App_Plugins/Terratype.GoogleMapsV3/1.0.0/";

        [JsonProperty(PropertyName = "id")]
        public override string Id
        {
            get
            {
                return "Terratype.GoogleMapsV3";
            }
        }

        public override string Name
        {
            get
            {
                return "terratypeGoogleMapsV3_name";            //  Value is in the language file
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeGoogleMapsV3_description";     //  Value is in the language file
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "terratypeGoogleMapsV3_referenceUrl";    //  Value is in the language file
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

        public override bool CanSearch
        {
            get
            {
                return true;
            }
        }

        [JsonProperty(PropertyName = "version")]
        public string Version { get; set; }

        /// <summary>
        /// API Key from https://console.developers.google.com/apis/credentials
        /// </summary>
        [JsonProperty(PropertyName = "apiKey")]
        public string ApiKey { get; set; }

        [JsonProperty(PropertyName = "forceHttps")]
        public bool ForceHttps { get; set; }

        [JsonProperty(PropertyName = "language")]
        public string Language { get; set; }

        [JsonProperty(PropertyName = "predefineStyling")]
        public string PredefineStyling { get; set; }

        [JsonProperty(PropertyName = "showRoads")]
        public bool ShowRoads { get; set; }

        [JsonProperty(PropertyName = "showLandmarks")]
        public bool ShowLandmarks { get; set; }

        [JsonProperty(PropertyName = "showLabels")]
        public bool ShowLabels { get; set; }

        [JsonProperty(PropertyName = "styles")]
        public dynamic Styles { get; set; }

        /// <summary>
        /// Where are the controls situation
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#ControlPosition
        /// </summary>
        public enum ControlPositions
        {       //  In order from top left to bottom right
            Default = 0,
            TopLeft = 1,           // Top left and flow towards the middle.
            TopCenter = 2,          // Center of the top row.
            TopRight = 3,           // Top right and flow towards the middle
            LeftTop = 5,            // On the left, below top-left elements, and flow downwards.
            RightTop = 7,           // On the right, below top-right elements, and flow downwards.
            LeftCenter = 4,         // Center of the left side.
            Center = 13,
            RightCenter = 8,        // Center of the right side.
            LeftBottom = 6,         // On the left, above bottom-left elements, and flow upwards.
            RightBottom = 9,        // On the right, above bottom-right elements, and flow upwards.
            BottomLeft = 10,         // Bottom left and flow towards the middle. Elements are positioned to the right of the Google logo.
            BottomCenter = 11,       // Center of the bottom row.
            BottomRight = 12        // Bottom right and flow towards the middle. Elements are positioned to the left of the copyrights.
        }

        /// <summary>
        /// Control styles
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapType
        /// </summary>
        [JsonObject(MemberSerialization.OptIn)]
        public class VarietyDefinition
        {
            public enum SelectorType
            {
                Default = 0,
                HorizontalBar = 1,
                DropdownMenu = 2
            }

            public class SelectorDefinition
            {
                [JsonProperty(PropertyName = "type")]

                public SelectorType Type { get; set; }

                [JsonProperty(PropertyName = "position")]
                public ControlPositions Position { get; set; }
            }

            [JsonProperty(PropertyName = "basic")]
            public bool Basic { get; set; }

            [JsonProperty(PropertyName = "satellite")]
            public bool Satellite { get; set; }

            [JsonProperty(PropertyName = "terrain")]
            public bool Terrain { get; set; }

            [JsonProperty(PropertyName = "selector")]
            public SelectorDefinition Selector { get; set; }
        }

        [JsonProperty(PropertyName = "variety")]
        public VarietyDefinition Variety { get; set; }

        [JsonObject(MemberSerialization.OptIn)]
        public class Control
        {
            [JsonProperty(PropertyName = "enable")]
            public bool Enable { get; set; }

            [JsonProperty(PropertyName = "position")]
            public ControlPositions Position { get; set; }
        }

        [JsonProperty(PropertyName = "streetView")]
        public Control StreetView { get; set; }

        [JsonProperty(PropertyName = "fullscreen")]
        public Control Fullscreen { get; set; }

        [JsonProperty(PropertyName = "scale")]
        public Control Scale { get; set; }

        [JsonProperty(PropertyName = "zoomControl")]
        public Control ZoomControl { get; set; }


        [JsonObject(MemberSerialization.OptIn)]
        public class SearchDefinition
        {
            public enum SearchStatus { Disable = 0, Enable, Autocomplete };

            [JsonProperty(PropertyName = "enable")]
            public SearchStatus Enable { get; set; }

            [JsonObject(MemberSerialization.OptIn)]
            public class LimitDefinition
            {
                [JsonProperty(PropertyName = "countries")]
                public IEnumerable<string> Countries { get; set; }
            }
            public LimitDefinition Limit { get; set; }
        }

        [JsonProperty(PropertyName = "search")]
        public SearchDefinition Search { get; set; }

        private string GoogleScript(Models.Model model)
        {
            var url = new StringBuilder();

            var provider = model.Provider as GoogleMapsV3;

            if (provider.ForceHttps)
            {
                url.Append("https:");
            }

            url.Append(String.Equals(model.Position.Id, Terratype.CoordinateSystems.Gcj02._Id, StringComparison.InvariantCultureIgnoreCase) ?
                "//maps.google.cn" : "//maps.googleapis.com/");

            url.Append("maps/api/js?v=");
            url.Append(String.IsNullOrWhiteSpace(provider.Version) ? "3" : provider.Version);
            url.Append(@"&libraries=places&callback=TerratypeGoogleMapsV3CallbackRender");
            if (!String.IsNullOrWhiteSpace(provider.ApiKey))
            {
                url.Append(@"&key=");
                url.Append(provider.ApiKey);
            }
            if (!String.IsNullOrWhiteSpace(provider.Language))
            {
                url.Append(@"&language=");
                url.Append(provider.Language);
            }
            return url.ToString();
        }

        private void Resource(string resourceName, HtmlTextWriter writer)
        {
            using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName))
            {
                using (var reader = new StreamReader(stream))
                {
                    writer.Write(reader.ReadToEnd());
                }
            }
        }

        /// <summary>
        /// Returns the Html that renders this map
        /// </summary>
        /// <param name="model"></param>
        /// <param name="height"></param>
        /// <param name="language"></param>
        /// <param name="label"></param>
        /// <returns></returns>
        public override void GetHtml(HtmlTextWriter writer, int mapId, Models.Model model, int height, string language, string labelId)
        {
            const string guid = "b72310d2-7041-4234-a6c5-6c5c2fdd708e";
            var id = nameof(Terratype) + "." + nameof(GoogleMapsV3) + Guid.NewGuid().ToString();

            writer.AddAttribute("data-markerclusterer-url", UrlPath + "images/m");
            writer.AddAttribute("data-googlemapsv3", HttpUtility.UrlEncode(JsonConvert.SerializeObject(model), System.Text.Encoding.Default));
            writer.AddAttribute("data-map-id", "m" + mapId.ToString());
            writer.AddAttribute("data-label-id", labelId);
            writer.AddAttribute("data-id", id);
            writer.AddStyleAttribute(HtmlTextWriterStyle.Display, "none");
            writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype) + '.' + nameof(GoogleMapsV3));
            writer.RenderBeginTag(HtmlTextWriterTag.Div);

            if (!HttpContext.Current.Items.Contains(guid))
            {
                HttpContext.Current.Items.Add(guid, true);
                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath + "scripts/Terratype.Renderer.js");
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();


                writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath + "scripts/markerclusterer.min.js");
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();

                writer.AddAttribute(HtmlTextWriterAttribute.Src, GoogleScript(model));
                writer.AddAttribute("defer", "");
                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.RenderEndTag();
            }

            writer.AddAttribute(HtmlTextWriterAttribute.Id, id);
            writer.AddStyleAttribute(HtmlTextWriterStyle.Height, height.ToString() + "px");
            writer.RenderBeginTag(HtmlTextWriterTag.Div);
            writer.RenderEndTag();
            writer.RenderEndTag();
        }

    }
}
