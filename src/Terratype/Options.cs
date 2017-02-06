using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype
{
    //  Used to configure how you would like to display maps via the Html.Terratype() razor command
    public class Options
    {
        /// <summary>
        /// Height of the map in pixels, maps can struggle to display without a real pixel height
        /// </summary>
        public int? Height { get; set; }

        /// <summary>
        /// Language of the map, best to use 2 letter or 4 letter culture value
        /// </summary>
        public string Language { get; set; }

        /// <summary>
        /// Which map set is this. All maps of the same set (eg have the same MapSetId) will be combined into a single map with multiple icons displayed
        /// </summary>
        public int? MapSetId { get; set; }

        /// <summary>
        /// Initial zoom of this map set, if not set will use the zoom of the first map of set
        /// </summary>
        public int? Zoom { get; set; }

        /// <summary>
        /// Initial position that you wish to display this map, if not set will use the position of the first map
        /// </summary>
        public Models.Position Position { get; set; }

        /// <summary>
        /// Your own custom provider, otherwise will use the provider from the first map of the map set
        /// </summary>
        public Models.Provider Provider { get; set; }

    }
}
