using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Globalization;
using System.Threading;
using Terratype.CoordinateSystems;

//  Given When Then

namespace Terratype.Tests.CoordinateSystems
{
    [TestClass]
    public class Gcj02
    {
        private Random rnd = new Random();

        private LatLng RandomLatLng()
        {
            return new LatLng()
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

                var gcj02 = new Terratype.CoordinateSystems.Gcj02(latlng);

                var parse = gcj02.ToString();
                gcj02.Parse(parse);

                var parse2 = gcj02.ToString();

                Assert.AreEqual(parse, parse2);

                var datum = gcj02.Datum;
                gcj02.Datum = datum;

                var compare = gcj02.ToWgs84();

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
                var datum = new Terratype.CoordinateSystems.Gcj02.DatumType()
                {
                    Latitude = latlng.Latitude,
                    Longitude = latlng.Longitude
                };

                var gcj02 = new Terratype.CoordinateSystems.Gcj02(datum);

                var parse = gcj02.ToString();
                gcj02.Parse(parse);

                var parse2 = gcj02.ToString();

                Assert.AreEqual(parse, parse2);

                var compare = gcj02.Datum;
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

        private double MetersToDecimalDegrees(double meters, double latitude)
        {
            return meters / (111.32 * 1000 * Math.Cos(latitude * (Math.PI / 180)));
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
                    var test = latlng.Latitude.ToString(CultureInfo.InvariantCulture) + "," +
                        latlng.Longitude.ToString(CultureInfo.InvariantCulture);

                    var gcj02 = new Terratype.CoordinateSystems.Gcj02(test);

                    var parse = gcj02.ToString();
                    gcj02.Parse(parse);

                    var parse2 = gcj02.ToString();

                    Assert.AreEqual(parse, parse2);

                    var datum = gcj02.Datum;
                    Assert.AreEqual(latlng.Latitude, datum.Latitude, Delta);
                    Assert.AreEqual(latlng.Longitude, datum.Longitude, Delta);

                    var compare = gcj02.ToWgs84();

                    if (gcj02.IsChina)
                    {
                        //  Calculate the maximum difference at this latitute between wgs84 and gcj02. We are allowing upto 2km difference
                        var maximumDifference = MetersToDecimalDegrees(2000.0, compare.Latitude);

                        var latitudeDifference = Math.Abs(latlng.Latitude - compare.Latitude);
                        Assert.IsTrue(latitudeDifference < maximumDifference);

                        var longitudeDifference = Math.Abs(latlng.Longitude - compare.Longitude);
                        Assert.IsTrue(longitudeDifference < maximumDifference);
                    }
                    else
                    {
                        //  If this isn't china then the datum will hold a wgs84 position
                        Assert.AreEqual(latlng.Latitude, compare.Latitude, Delta);
                        Assert.AreEqual(latlng.Longitude, compare.Longitude, Delta);
                    }
                }
            }
        }
    }
}
