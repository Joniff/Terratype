using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Terratype.Test.Umbraco772.Schema;
using Umbraco.Web.Models;

namespace Terratype.Test.Umbraco772.Controllers
{
	public class MappyController : Umbraco.Web.Mvc.RenderMvcController
	{
        public override ActionResult Index(RenderModel model)
        {
            return CurrentTemplate<Mappy>(new Mappy(model.Content));
        }
	}
}