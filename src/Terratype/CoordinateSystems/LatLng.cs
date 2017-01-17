using Newtonsoft.Json;
using System.Diagnostics;

namespace Terratype.CoordinateSystems
{
    [DebuggerDisplay("{Latitude:##0.0#####},{Longitude:##0.0#####}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class LatLng
    {
        /// Latitude of map position in WGS 84 system
        [JsonProperty]
        public double Latitude { get; set; }

        /// <summary>
        /// Longitude of map position in WGS 84 system
        /// </summary>
        [JsonProperty]
        public double Longitude { get; set; }
    }
}
