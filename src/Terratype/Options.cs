using System;
using System.Collections.Generic;
using System.ComponentModel;
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
        /// Initial zoom of this map set, if not set will pick a zoom that allows all markers to be visible
        /// </summary>
        public int? Zoom { get; set; }

        /// <summary>
        /// Initial position that you wish to display this map, if not will try and display all markers
        /// </summary>
        public Models.Position Position { get; set; }

        /// <summary>
        /// Your own custom provider, otherwise will use the provider from the first map of the map set
        /// </summary>
        public Models.Provider Provider { get; set; }

        /// <summary>
        /// Your own custom icon, otherwise will use the icon from the first map of the map set
        /// </summary>
        public Models.Icon Icon { get; set; }

        /// <summary>
        /// Most base map providers don't detect dom changes (Changes to the layout of a webpage, be it resizing the browser, 
        /// hiding/showing/resizing divs etc) - This means terratype tries to monitor for changes and redraw the map when required
        /// You can use jquery, which is superior, if and only if all your changes to your dom happen via jQuery and you have jQuery installed
        /// otherwise use javascript.
        /// If you don't care about changes then you can disable monitoring, but the map will not redraw when changes happen
        /// </summary>
        public enum DomMonitorTypes
        {
            [Description("Use standard javascript to detect DOM changes")]
            Javascript = 0,     //  Use standard ECMAScript 5 to detect DOM changes

            [Description("Use External jQuery library to detect DOM changes")]
            JQuery = 1,         //    You will need to load jQuery on the page yourself, but this is a superior option to Javascript

            [Description("No monitoring of DOM")]
            Disable = 2,         //    This will disable detection of DOM changes, even if the browser is resized the map will not update
        }

        /// <summary>
        /// How do you wish to monitor for changes to the dom, so that the map can be redrawn to reflect changes like browser resizing or layout changes
        /// </summary>
        public DomMonitorTypes DomMonitorType { get; set; }

		/// <summary>
		/// Should the label be visible straight away
		/// </summary>
		public bool AutoShowLabel { get; set; }

		/// <summary>
		/// Should the map recenter after a window resize
		/// </summary>
		public bool AutoRecenterAfterRefresh { get; set; }

		/// <summary>
		/// Should the map try and display all markers
		/// </summary>
		public bool AutoFit { get; set; }
    }
}
