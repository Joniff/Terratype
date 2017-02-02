using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Web;


namespace Terratype
{
    [DebuggerDisplay("{Position},{Zoom}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class Model
    {
        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty]
        public Providers.Provider Provider { get; set; }

        /// <summary>
        /// Where is this map point to
        /// </summary>
        [JsonProperty]
        public CoordinateSystems.Position Position { get; set; }

        public int Zoom { get; set; }

        public Models.Icon Icon { get; set; }

        public string Lookup { get; set; }

        /// <summary>
        /// Default location for map
        /// </summary>
        [JsonProperty]
        public CoordinateSystems.Position DefaultPosition { get; set; }

        public Model()
        {

        }

        public Model(Model other)
        {
            Provider = other.Provider;
            Position = other.Position;
            Zoom = other.Zoom;
            Icon = other.Icon;
            Lookup = other.Lookup;
            DefaultPosition = other.DefaultPosition;
        }
    }
}
