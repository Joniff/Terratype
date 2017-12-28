using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Terratype.TestSite.Schema;
using Umbraco.Web.Models;

namespace Terratype.TestSite.Controllers
{
	public class MappyController : Umbraco.Web.Mvc.RenderMvcController
	{
        public override ActionResult Index(RenderModel model)
        {
            return CurrentTemplate<Mappy>(new Mappy(model.Content));
        }
	}
}