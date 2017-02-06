using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace Terratype
{
    public static class TerratypeHtml
    {
        private const int DefaultHeight = 400;
        private const string guid = "c9e9e052-7d33-46d3-a809-8b6e88b63ae3";

        private static int Counter
        {
            get
            {
                var c = HttpContext.Current.Items[guid] as int?;
                if (c == null)
                {
                    c = 65536;
                }
                else
                {
                    c++;
                }
                HttpContext.Current.Items[guid] = c;
                return (int)c;
            }
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Options options)
        {
            return htmlHelper.Terratype(options, null, null);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map)
        {
            return htmlHelper.Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map, null);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map,  label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Options options, Models.Model map)
        {
            return htmlHelper.Terratype(options, map, null);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Options options, Models.Model map, params Func<object, object>[] label)
        {
            if (options == null && map == null)
            {
                //  Nothing to do, as no map or options are present
                return new HtmlString("");
            }

            if (map == null && options.Provider == null)
            {
                throw new ArgumentNullException("No map provider declared");
            }

            if (options == null)
            {
                options = new Options()
                {
                    MapSetId = Counter,
                    Height = DefaultHeight
                };
            }

            Models.Model merge = null;

            if (map == null)
            {
                merge = new Models.Model()
                {
                    Provider = options.Provider,
                    Position = options.Position
                };
                if (options.Zoom != null)
                {
                    merge.Zoom = (int)options.Zoom;
                }
            }
            else
            {
                merge = new Models.Model()
                {
                    Provider = map.Provider,
                    Position = map.Position,
                    Zoom = map.Zoom,
                    Icon = map.Icon
                };
                if (options.Provider != null)
                {
                    //  Merge providers, with options taking precedents
                    var mergeJson = JObject.FromObject(merge.Provider);
                    mergeJson.Merge(JObject.FromObject(options.Provider), new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Replace });
                    merge.Provider = mergeJson.ToObject<Models.Provider>();
                }
            }

            var builder = new StringWriter(System.Globalization.CultureInfo.InvariantCulture);
            using (var writer = new HtmlTextWriter(builder))
            {
                writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype));
                writer.RenderBeginTag(HtmlTextWriterTag.Div);

                var labelId = nameof(Terratype) + Guid.NewGuid().ToString();
                merge.Provider.GetHtml(writer, options.MapSetId ?? Counter, merge, options.Height ?? DefaultHeight, options.Language, labelId);
                if (label != null)
                {
                    writer.AddStyleAttribute(HtmlTextWriterStyle.Display, "none");
                    writer.RenderBeginTag(HtmlTextWriterTag.Div);
                    writer.AddAttribute(HtmlTextWriterAttribute.Id, labelId);
                    writer.RenderBeginTag(HtmlTextWriterTag.Div);
                    foreach (var value in label)
                    {
                        writer.Write(value.DynamicInvoke(htmlHelper.ViewContext));
                    }
                    writer.RenderEndTag();
                    writer.RenderEndTag();
                }

                writer.RenderEndTag();

            }
            return new HtmlString(builder.ToString());
        }
    }
}
