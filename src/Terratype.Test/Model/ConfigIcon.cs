using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Test
{
    [TestClass]
    public class ConfigIcon
    {
        [TestMethod]
        public void Convert1()
        {
            var original = new Terratype.Models.ConfigIcon()
            {
                Name = "fred",
                Image = new Uri("https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png"),
                ShadowImage = new Uri("https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png"),
                Size = new Terratype.Models.Size()
                {
                    Width = 11,
                    Height = 22
                },
                Anchor = new Terratype.Models.Anchor()
                {
                    Horizontal = Terratype.Models.AnchorHorizontal.Style.Center,
                    Vertical = Terratype.Models.AnchorVertical.Style.Center
                }
            };

            var copy = new Terratype.Models.ConfigIcon(original.ToString());

            Assert.AreEqual<string>(original.Name, copy.Name);
            Assert.AreEqual<string>(original.Image.AbsoluteUri, copy.Image.AbsoluteUri);
            Assert.AreEqual<string>(original.ShadowImage.AbsoluteUri, copy.ShadowImage.AbsoluteUri);
            Assert.AreEqual<int>(original.Size.Width, copy.Size.Width);
            Assert.AreEqual<int>(original.Size.Height, copy.Size.Height);
            Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(original.Anchor.Horizontal.Automatic, copy.Anchor.Horizontal.Automatic);
            Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(original.Anchor.Vertical.Automatic, copy.Anchor.Vertical.Automatic);
        }

        [TestMethod]
        public void Convert2()
        {
            var original = new Models.ConfigIcon()
            {
                Name = "harry",
                Image = new Uri("https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png"),
                ShadowImage = new Uri("https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-waypoint-blue.png"),
                Size = new Models.Size()
                {
                    Width = 33,
                    Height = 44
                },
                Anchor = new Models.Anchor()
                {
                    Horizontal = 11,
                    Vertical = 22
                }
            };

            var copy = new Models.ConfigIcon(original.ToString());

            Assert.AreEqual<string>(original.Name, copy.Name);
            Assert.AreEqual<string>(original.Image.AbsoluteUri, copy.Image.AbsoluteUri);
            Assert.AreEqual<string>(original.ShadowImage.AbsoluteUri, copy.ShadowImage.AbsoluteUri);
            Assert.AreEqual<int>(original.Size.Width, copy.Size.Width);
            Assert.AreEqual<int>(original.Size.Height, copy.Size.Height);
            Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(original.Anchor.Horizontal.Automatic, copy.Anchor.Horizontal.Automatic);
            Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(original.Anchor.Vertical.Automatic, copy.Anchor.Vertical.Automatic);
        }

    }
}
