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
        private const int defaultHeight = 400;
        private const string guid = "c9e9e052-7d33-46d3-a809-8b6e88b63ae3";

        private static int counter
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
                return (int) c;
            }
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map)
        {
            return htmlHelper.Terratype(counter, map, defaultHeight, (string)null);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, int height)
        {
            return htmlHelper.Terratype(counter, map, height, (string)null);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, int height, string language)
        {
            return htmlHelper.Terratype(counter, map, height, language);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, string language)
        {
            return htmlHelper.Terratype(counter, map, defaultHeight, language);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(counter, map, defaultHeight, (string)null, label);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, int height, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(counter, map, height, (string)null, label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, Models.Model map, string language, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(counter, map, defaultHeight, language, label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map)
        {
            return htmlHelper.Terratype(id, map, defaultHeight, (string)null);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, int height)
        {
            return htmlHelper.Terratype(id, map, height, (string)null);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, int height, string language)
        {
            return htmlHelper.Terratype(id, map, height, language);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, string language)
        {
            return htmlHelper.Terratype(id, map, defaultHeight, language);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(id, map, defaultHeight, (string)null, label);
        }
        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, int height, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(id, map, height, (string)null, label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, string language, params Func<object, object>[] label)
        {
            return htmlHelper.Terratype(id, map, defaultHeight, language, label);
        }

        public static IHtmlString Terratype(this HtmlHelper htmlHelper, int id, Models.Model map, int height, string language, params Func<object, object>[] label)
        {
            if (map == null)
            {
                throw new ArgumentNullException(nameof(map));
            }

            if (map.Provider == null)
            {
                throw new ArgumentNullException(nameof(map.Provider));
            }

            if (map.Position == null)
            {
                throw new ArgumentNullException(nameof(map.Position));
            }

            if (map.Icon == null)
            {
                throw new ArgumentNullException(nameof(map.Icon));
            }

            var builder = new StringWriter(System.Globalization.CultureInfo.InvariantCulture);
            using (var writer = new HtmlTextWriter(builder))
            {
                writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype));
                writer.RenderBeginTag(HtmlTextWriterTag.Div);

                var labelId = nameof(Terratype) + Guid.NewGuid().ToString();
                map.Provider.GetHtml(writer, id, map, height, language, labelId);
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
