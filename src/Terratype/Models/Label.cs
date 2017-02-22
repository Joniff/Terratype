using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;
using System.Web;
using System.Web.UI;

namespace Terratype.Models
{
    [DebuggerDisplay("{Id}")]
    [JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
    public abstract class Label : Frisk.IFrisk
    {
        /// <summary>
        /// Unique identifier of label
        /// </summary>
        [JsonProperty(PropertyName = "id")]
        public abstract string Id { get; }

        /// <summary>
        /// Name of label
        /// </summary>
        public abstract string Name { get; }

        /// <summary>
        /// Description of label
        /// </summary>
        public abstract string Description { get; }

        /// <summary>
        /// Does this map have a label that the editor can edit
        /// </summary>
        [JsonProperty(PropertyName = "enable")]
        public bool Enable { get; }

        public enum EditPositions { Below = 0, Overlay = 1};

        /// <summary>
        /// Edit position
        /// </summary>
        [JsonProperty(PropertyName = "editPosition")]
        public EditPositions EditPosition { get; }

        public static IDictionary<string, Type> Register
        {
            get
            {
                return Frisk.Frisk.Register<Label>();
            }
        }

        /// <summary>
        /// Create a derived Position with a particular Id
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Label Create(string id)
        {
            Type derivedType = null;
            if (Register.TryGetValue(id, out derivedType))
            {
                return System.Activator.CreateInstance(derivedType) as Label;
            }
            return null;
        }

        /// <summary>
        /// Create a derived Label from a particular type
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        public static Label Create(Type type)
        {
            return System.Activator.CreateInstance(type) as Label;
        }

        public abstract void GetHtml(HtmlTextWriter writer, Models.Model model);

    }
}

