using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Threading;

//  Given When Then

namespace Terratype.Tests.CoordinateSystems
{
    [TestClass]
    public class Wgs84
    {
        private Random rnd = new Random();

        private Terratype.Models.LatLng RandomLatLng()
        {
            return new Terratype.Models.LatLng()
            {
                Latitude = (rnd.NextDouble() * 180.0) - 90.0,
                Longitude = (rnd.NextDouble() * 360.0) - 180.0
            };
        }

        private double _delta = double.NaN;
        private double Delta
        {
            get
            {
                if (!Double.IsNaN(_delta))
                {
                    return _delta;
                }

                _delta = 1.0;
                for (var count = 0; count != new Terratype.CoordinateSystems.Wgs84().Precision; count++)
                {
                    _delta = _delta / 10.0;
                }
                return _delta;
            }
        }

        [TestMethod]
        public void LatLng_ConvertToWgsAndStringAndDatum_TheyShouldAllBeEqual()
        {
            var attempts = 1000;
            while (--attempts != 0)
            {
                //  Create a test position
                var latlng = RandomLatLng();

                var wgs84 = new Terratype.CoordinateSystems.Wgs84(latlng);

                var parse = wgs84.ToString();
                wgs84.Parse(parse);

                var parse2 = wgs84.ToString();

                Assert.AreEqual(parse, parse2);

                var datum = wgs84.Datum;
                Assert.AreEqual(latlng.Latitude, datum.Latitude, Delta);
                Assert.AreEqual(latlng.Longitude, datum.Longitude, Delta);

                wgs84.Datum = datum;

                var compare = wgs84.ToWgs84();

                Assert.AreEqual(latlng.Latitude, compare.Latitude, Delta);
                Assert.AreEqual(latlng.Longitude, compare.Longitude, Delta);
            }
        }

        [TestMethod]
        public void Datum_ConvertToWgsAndStringAndLatLng_TheyShouldAllBeEqual()
        {
            var attempts = 1000;
            while (--attempts != 0)
            {
                var latlng = RandomLatLng();
                //  Create a test position
                var datum = new Terratype.CoordinateSystems.Wgs84.DatumType()
                {
                    Latitude = latlng.Latitude,
                    Longitude = latlng.Longitude
                };

                var wgs84 = new Terratype.CoordinateSystems.Wgs84(datum);

                var parse = wgs84.ToString();
                wgs84.Parse(parse);

                var parse2 = wgs84.ToString();

                Assert.AreEqual(parse, parse2);

                var compare = wgs84.ToWgs84();
                Assert.AreEqual(datum.Latitude, compare.Latitude, Delta);
                Assert.AreEqual(datum.Longitude, compare.Longitude, Delta);
            }
        }


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

        private string[] Cultures = new string[]
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

        //  Note this is just a base test for testing expected C# behavour, if this fails then c# has changed
        [TestMethod]
        public void Double_ConvertToStringUsingDifferentCultures_DoubleIsConvertedWithCorrectCulturalSetting()  
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
        public void StringWithDifferentCulture_ConvertToWgsAndDatumAndLatLng_TheyShouldAllBeEqual()
        {
            foreach (var culture in Cultures)
            {
                Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);
                var attempts = 1000;
                while (--attempts != 0)
                {
                    var latlng = RandomLatLng();
                    //  Create a test position
                    var text = latlng.Latitude.ToString(CultureInfo.InvariantCulture) + "," +
                        latlng.Longitude.ToString(CultureInfo.InvariantCulture);

                    var wgs84 = new Terratype.CoordinateSystems.Wgs84(text);

                    var parse = wgs84.ToString();
                    wgs84.Parse(parse);

                    var parse2 = wgs84.ToString();

                    Assert.AreEqual(parse, parse2);

                    var compare = wgs84.ToWgs84();
                    Assert.AreEqual(latlng.Latitude, compare.Latitude, Delta);
                    Assert.AreEqual(latlng.Longitude, compare.Longitude, Delta);
                }
            }
        }
    }
}
