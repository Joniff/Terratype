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
            [JsonProperty(PropertyName = "id")]
            public string Id { get; set; }

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

        [JsonProperty(PropertyName = "mapSource")]
        public IEnumerable<MapSourceDefinition> MapSources { get; set; }


        public override void GetHtml(HtmlTextWriter writer, int mapId, Models.Model model, string labelId = null, int? height = null, string language = null)
        {
            throw new NotImplementedException();
        }

    }
}
