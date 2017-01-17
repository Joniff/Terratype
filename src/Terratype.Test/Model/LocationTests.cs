using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Threading;
using System.Collections.Generic;

namespace Terratype.Test
{
    [TestClass]
    public class LocationTest
    {
        //  See if we are correctly setting culture
        [TestMethod]
        public void Culture()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");
            double d = -1.01;
            Assert.AreEqual(d.ToString(), "-1.01");

            Thread.CurrentThread.CurrentCulture = new CultureInfo("en-US");
            Assert.AreEqual(d.ToString(), "-1.01");

            Thread.CurrentThread.CurrentCulture = new CultureInfo("fr-FR");
            Assert.AreEqual(d.ToString(), "-1,01");

            Thread.CurrentThread.CurrentCulture = new CultureInfo("de-DE");
            Assert.AreEqual(d.ToString(), "-1,01");

        }

        [TestMethod]
        public void Convert()
        {
            var cultures = new string[]
            {
                "",
                "en-US",
                "en-GB",
                "ar-EG",
                "ar-SA",
                "zh-CN",
                "hr-HR",
                "cs-CZ",
                "da-DK",
                "nl-NL",
                "fa-IR",
                "fi-FI",
                "fr-FR",
                "de-DE",
                "el-GR",
                "gu-IN",
                "hi-IN",
                "hu-HU",
                "it-IT",
                "ja-JP",
                "ko-KR",
                "pl-PL",
                "es-ES",
                "tr-TR",
                "vi-VN"
            };

            var values = new string[]
            {
                "1,2,3",
                "-1,-2,3",
                "1,-2,3",
                "-1,2,3",

                "1.2,3.4,4",
                "-1.2,3.4,4",
                "1.2,-3.4,4",
                "-1.2,-3.4,4",

                "100.2,300.4,5",
                "-100.2,300.4,5",
                "100.2,-300.4,5",
                "-100.2,-300.4,5",

                "0.1,0.2,6",
                "-0.1,0.2,6",
                "0.1,-0.2,6",
                "-0.1,-0.2,6",

                "0.02,0.03,7",
                "-0.02,0.03,7",
                "0.02,-0.03,7",
                "-0.02,-0.03,7",

                "0.02,0.03,7",
                "-0.02,0.03,7",
                "0.02,-0.03,7",
                "-0.02,-0.03,7",

                "123.456789,987.654321,8",
                "-123.456789,987.654321,8",
                "123.456789,-987.654321,8",
                "-123.456789,-987.654321,8",

                "123.000009,987.000001,9",
                "-123.000009,987.000001,9",
                "123.000009,-987.000001,9",
                "-123.000009,-987.000001,9",

                "100.000009,900.000001,10",
                "-100.000009,900.000001,10",
                "100.000009,-900.000001,10",
                "-100.000009,-900.000001,10"
            };

            foreach (var culture in cultures)
            {
                Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);

                System.Console.WriteLine(culture);
                System.Console.WriteLine(1.10);
                
                foreach (var value in values)
                {
                    var model = new Terratype.Model(value);
                    var compareValue = model.ToString();
                    Assert.AreEqual(value, compareValue);
                }
            }
        }

        [TestMethod]
        public void Csv1()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");

            var model = new Terratype.Model("123.456789,987.654321,8,http://domain/folder/file.jpg,,22,33");

            for(var i = 0; i != 5; i++)
            {
                Assert.AreEqual<decimal>(model.Latitude, 123.456789M);
                Assert.AreEqual<decimal>(model.Longitude, 987.654321M);
                Assert.AreEqual<int>(model.Zoom, 8);
                Assert.AreEqual(model.Icon.Image.AbsoluteUri, "http://domain/folder/file.jpg");
                Assert.IsNull(model.Icon.ShadowImage);
                Assert.AreEqual<int>(model.Icon.Size.Width, 22);
                Assert.AreEqual<int>(model.Icon.Size.Height, 33);
                Assert.IsTrue(!model.Icon.Anchor.Horizontal.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(model.Icon.Anchor.Horizontal.Automatic, Models.AnchorHorizontal.Style.Center);
                Assert.IsTrue(!model.Icon.Anchor.Vertical.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(model.Icon.Anchor.Vertical.Automatic, Models.AnchorVertical.Style.Bottom);

                model = new Terratype.Model(model.ToCsv());
            }
        }

        [TestMethod]
        public void Csv2()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");

            var model = new Terratype.Model("123.456789,987.654321,8,http://domain/folder/file.jpg,,22,33,44,55");

            for(var i = 0; i != 5; i++)
            {
                Assert.AreEqual<decimal>(model.Latitude, 123.456789M);
                Assert.AreEqual<decimal>(model.Longitude, 987.654321M);
                Assert.AreEqual<int>(model.Zoom, 8);
                Assert.AreEqual(model.Icon.Image, "http://domain/folder/file.jpg");
                Assert.IsNull(model.Icon.ShadowImage);
                Assert.AreEqual<int>(model.Icon.Size.Width, 22);
                Assert.AreEqual<int>(model.Icon.Size.Height, 33);
                Assert.IsTrue(model.Icon.Anchor.Horizontal.IsManual());
                Assert.AreEqual<int>(model.Icon.Anchor.Horizontal.Manual, 44);
                Assert.IsTrue(model.Icon.Anchor.Vertical.IsManual());
                Assert.AreEqual<int>(model.Icon.Anchor.Vertical.Manual, 55);

                model = new Terratype.Model(model.ToCsv());
            }
        }

        [TestMethod]
        public void Json1()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");

            var model = new Terratype.Model("123.456789,987.654321,8,http://domain/folder/file.jpg,https://domain/folder/shadow.jpg,22,33,left,top");

            for(var i = 0; i != 5; i++)
            {
                Assert.AreEqual<decimal>(model.Latitude, 123.456789M);
                Assert.AreEqual<decimal>(model.Longitude, 987.654321M);
                Assert.AreEqual<int>(model.Zoom, 8);
                Assert.AreEqual(model.Icon.Image, "http://domain/folder/file.jpg");
                Assert.AreEqual(model.Icon.ShadowImage, "https://domain/folder/shadow.jpg");
                Assert.AreEqual<int>(model.Icon.Size.Width, 22);
                Assert.AreEqual<int>(model.Icon.Size.Height, 33);
                Assert.IsTrue(!model.Icon.Anchor.Horizontal.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(model.Icon.Anchor.Horizontal.Automatic, Models.AnchorHorizontal.Style.Left);
                Assert.IsTrue(!model.Icon.Anchor.Vertical.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(model.Icon.Anchor.Vertical.Automatic, Models.AnchorVertical.Style.Top);

                model = new Terratype.Model(model.ToJson());
            }
        }

        [TestMethod]
        public void Json2()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");

            var model = new Terratype.Model("123.456789,987.654321,8,http://domain/folder/file.jpg,https://domain/folder/shadow.jpg,22,33,right,center");

            for(var i = 0; i != 5; i++)
            {
                Assert.AreEqual<decimal>(model.Latitude, 123.456789M);
                Assert.AreEqual<decimal>(model.Longitude, 987.654321M);
                Assert.AreEqual<int>(model.Zoom, 8);
                Assert.AreEqual(model.Icon.Image, "http://domain/folder/file.jpg");
                Assert.AreEqual(model.Icon.ShadowImage, "https://domain/folder/shadow.jpg");
                Assert.AreEqual<int>(model.Icon.Size.Width, 22);
                Assert.AreEqual<int>(model.Icon.Size.Height, 33);
                Assert.IsTrue(!model.Icon.Anchor.Horizontal.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(model.Icon.Anchor.Horizontal.Automatic, Models.AnchorHorizontal.Style.Right);
                Assert.IsTrue(!model.Icon.Anchor.Vertical.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(model.Icon.Anchor.Vertical.Automatic, Models.AnchorVertical.Style.Center);

                model = new Terratype.Model(model.ToJson());
            }
        }

        [TestMethod]
        public void Json3()
        {
            Thread.CurrentThread.CurrentCulture = new CultureInfo("");

            var model = new Terratype.Model("123.456789,987.654321,8,http://domain/folder/file.jpg,https://domain/folder/shadow.jpg,22,33,left,top,abcdefg12345,GCJ-02,");

            for(var i = 0; i != 5; i++)
            {
                Assert.AreEqual<decimal>(model.Latitude, 123.456789M);
                Assert.AreEqual<decimal>(model.Longitude, 987.654321M);
                Assert.AreEqual<int>(model.Zoom, 8);
                Assert.AreEqual(model.Icon.Image, "http://domain/folder/file.jpg");
                Assert.AreEqual(model.Icon.ShadowImage, "https://domain/folder/shadow.jpg");
                Assert.AreEqual<int>(model.Icon.Size.Width, 22);
                Assert.AreEqual<int>(model.Icon.Size.Height, 33);
                Assert.IsTrue(!model.Icon.Anchor.Horizontal.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorHorizontal.Style>(model.Icon.Anchor.Horizontal.Automatic, Models.AnchorHorizontal.Style.Left);
                Assert.IsTrue(!model.Icon.Anchor.Vertical.IsManual());
                Assert.AreEqual<Terratype.Models.AnchorVertical.Style>(model.Icon.Anchor.Vertical.Automatic, Models.AnchorVertical.Style.Top);

                model = new Terratype.Model(model.ToJson());
            }
        }

    
    }
}
