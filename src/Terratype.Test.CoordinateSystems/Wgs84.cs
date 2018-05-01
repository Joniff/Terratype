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

        [TestMethod]
		public void TwoPositions_KnownDistanceApart_CorrectDistance()
		{
            foreach (var culture in Cultures)
            {
                Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);
                var newyork = new Terratype.CoordinateSystems.Wgs84("40.7128,-74.0060");
				var paris = new Terratype.CoordinateSystems.Wgs84("48.8566,2.3522");
				var moscow = new Terratype.CoordinateSystems.Wgs84("55.7558,37.6173");
				var toyko = new Terratype.CoordinateSystems.Wgs84("35.6895,139.6917");
				var cario = new Terratype.CoordinateSystems.Wgs84("30.0444,31.3257");
				var sydney = new Terratype.CoordinateSystems.Wgs84("-33.8688,151.2093");
				var rio = new Terratype.CoordinateSystems.Wgs84("-22.9068,-43.1729");
				var johannesburg = new Terratype.CoordinateSystems.Wgs84("-26.2041,28.0473");

				Assert.AreEqual(newyork.Distance(paris), paris.Distance(newyork), 1.0);
				Assert.AreEqual(moscow.DistanceInKm(sydney), sydney.DistanceInKm(moscow), 1.0);
				Assert.AreEqual(rio.DistanceInMiles(toyko), toyko.DistanceInMiles(rio), 1.0);
				Assert.AreEqual(johannesburg.Distance(cario), cario.Distance(johannesburg), 1.0);

				Assert.AreEqual(newyork.Distance(paris), 5837241.0, 10000.0);
				Assert.AreEqual(newyork.DistanceInKm(paris), 5837.0, 10.0);
				Assert.AreEqual(newyork.DistanceInMiles(paris), 3627.0, 10.0);

				Assert.AreEqual(moscow.Distance(johannesburg), 9158713.0, 10000.0);
				Assert.AreEqual(toyko.Distance(rio), 18567042.0, 10000.0);
				Assert.AreEqual(sydney.Distance(rio), 13521033.0, 10000.0);

			}
		}

        [TestMethod]
		public void TwoPositions_UnKnownDistanceApart_WithinEarth()
		{
            foreach (var culture in Cultures)
            {
                Thread.CurrentThread.CurrentCulture = new CultureInfo(culture);
                var attempts = 1000;
                while (--attempts != 0)
                {
                    var latlng1 = RandomLatLng();
                    var latlng2 = RandomLatLng();

                    var startWgs84 = new Terratype.CoordinateSystems.Wgs84(
						latlng1.Latitude.ToString(CultureInfo.InvariantCulture) + "," +
                        latlng1.Longitude.ToString(CultureInfo.InvariantCulture));

                    var endWgs84 = new Terratype.CoordinateSystems.Wgs84(
						latlng2.Latitude.ToString(CultureInfo.InvariantCulture) + "," +
                        latlng2.Longitude.ToString(CultureInfo.InvariantCulture));

					var distance = startWgs84.Distance(endWgs84);
					Assert.IsTrue(distance > 0.0 && distance < 20000000.0);		//	Somewhere on Earth
					Assert.AreEqual(distance, endWgs84.Distance(startWgs84), 1000.0);
				}
			}
		}
    }
}
