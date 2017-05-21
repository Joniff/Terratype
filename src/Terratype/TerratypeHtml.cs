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
using Umbraco.Core.Models;
using Umbraco.Web.Models;

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

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options)
        {
            return (htmlHelper as HtmlHelper).Terratype(options, null, null);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map)
        {
            return htmlHelper.Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map, null);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Models.Model map)
        {
            return (htmlHelper as HtmlHelper).Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map, null);
        }

        private static Models.Model Object2Model(object property)
        {
            if (property == null)
            {
                return null;
            }
            else if (property is IPublishedProperty)
            {
                var obj = (property as IPublishedProperty).Value;
                if (obj is Models.Model || obj.GetType().IsSubclassOf(typeof(Models.Model)))
                {
                    return obj as Models.Model;
                }
                else
                {
                    throw new ArgumentException();
                }
            }
            else if (property is Models.Model || property.GetType().IsSubclassOf(typeof(Models.Model)))
            {
                return property as Models.Model;
            }
            else
            {
                throw new ArgumentException();
            }
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, object property)
        {
            return (htmlHelper as HtmlHelper).Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, Object2Model(property), null);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, string propertyAlias)
        {
            return htmlHelper.Terratype(htmlHelper.ViewData.Model.Content.GetProperty(propertyAlias));
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map,  label);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Models.Model map, params Func<object, object>[] label)
        {
            return (htmlHelper as HtmlHelper).Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, map, label);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, object property, params Func<object, object>[] label)
        {
            return (htmlHelper as HtmlHelper).Terratype(new Options()
            {
                MapSetId = Counter,
                Height = DefaultHeight
            }, Object2Model(property), label);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, string propertyAlias, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(htmlHelper.ViewData.Model.Content.GetProperty(propertyAlias), label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Options options, Models.Model map)
        {
            return htmlHelper.Terratype(options, map, null);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, Models.Model map)
        {
            return (htmlHelper as HtmlHelper).Terratype(options, map, null);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, object property)
        {
            return (htmlHelper as HtmlHelper).Terratype(options, Object2Model(property), null);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, string propertyAlias)
        {
            return htmlHelper.Terratype(options, htmlHelper.ViewData.Model.Content.GetProperty(propertyAlias));
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, Models.Model map, params Func<object, object>[] label)
        {
            return (htmlHelper as HtmlHelper).Terratype(options, map, label);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, object property, params Func<object, object>[] label)
        {
            return (htmlHelper as HtmlHelper).Terratype(options, Object2Model(property), label);
        }

        public static IHtmlString Terratype(this HtmlHelper<RenderModel> htmlHelper, Options options, string propertyAlias, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(options, htmlHelper.ViewData.Model.Content.GetProperty(propertyAlias), label);
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
                    MapSetId = Counter
                };
            }

            Models.Model merge = null;

            if (map == null)
            {
                merge = new Models.Model()
                {
                    Provider = options.Provider,
                    Position = options.Position,
                    Zoom = (options.Zoom != null) ? (int) options.Zoom : 0,
                    Height = (options.Height != null) ? (int) options.Height : DefaultHeight,
                    Icon = options.Icon,
                };
            }
            else
            {
                merge = new Models.Model()
                {
                    Provider = map.Provider,
                    Position = map.Position,
                    Zoom = map.Zoom,
                    Icon = map.Icon,
                    Height = map.Height
                };
                if (options.Provider != null)
                {
                    //  Merge providers, with options taking precedents
                    var mergeJson = JObject.FromObject(merge.Provider);
                    mergeJson.Merge(JObject.FromObject(options.Provider), new JsonMergeSettings { MergeArrayHandling = MergeArrayHandling.Replace });
                    var providerType = (options.Provider is Models.Provider) ? map.Provider.GetType() : options.Provider.GetType();
                    merge.Provider = (Models.Provider) mergeJson.ToObject(providerType);
                }
                if (options.Zoom != null)
                {
                    merge.Zoom = (int) options.Zoom;
                }
                if (options.Height != null)
                {
                    merge.Height = (int) options.Height;
                }
                if (options.Icon != null)
                {
                    merge.Icon = options.Icon;
                }
                if (options.Position != null)
                {
                    merge.Position = options.Position;
                }
            }

            var builder = new StringWriter(System.Globalization.CultureInfo.InvariantCulture);
            using (var writer = new HtmlTextWriter(builder))
            {
                writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype));
                writer.RenderBeginTag(HtmlTextWriterTag.Div);

                var hasLabel = map != null && (label != null || (map.Label != null && map.Label.HasContent));
                var labelId = (hasLabel) ? nameof(Terratype) + Guid.NewGuid().ToString() : null;

                merge.Provider.GetHtml(writer, options.MapSetId ?? Counter, merge, labelId, merge.Height, options.Language, options.DomMonitorType);
                if (hasLabel)
                {
                    writer.AddStyleAttribute(HtmlTextWriterStyle.Display, "none");
                    writer.RenderBeginTag(HtmlTextWriterTag.Div);
                    writer.AddAttribute(HtmlTextWriterAttribute.Id, labelId);
                    writer.RenderBeginTag(HtmlTextWriterTag.Div);
                    if (label != null)
                    {
                        foreach (var value in label)
                        {
                            writer.Write(value.DynamicInvoke(htmlHelper.ViewContext));
                        }
                    }
                    else 
                    {
                        map.Label.GetHtml(writer, map);
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
