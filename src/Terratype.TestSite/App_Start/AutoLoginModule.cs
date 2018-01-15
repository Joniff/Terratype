using System;
using System.Web;
using Umbraco.Core.Models.Membership;
using Umbraco.Web.Security;
using Umbraco.Web.Security.Providers;
using WebActivatorEx;

[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(AutoLogin.AutoLoginModule), "Register")]
namespace AutoLogin
{
	public class AutoLoginModule : IHttpModule
	{
		public static void Register()
		{
			// Register our module
			Microsoft.Web.Infrastructure.DynamicModuleHelper.DynamicModuleUtility.RegisterModule(typeof(AutoLoginModule));
		}

		public void Init(HttpApplication application)
		{
			//application.BeginRequest += (new EventHandler(this.Application_BeginRequest));
			application.EndRequest += (new EventHandler(this.Application_EndRequest));
		}

		private void Application_EndRequest(object source, EventArgs e)
		{
			var application = (HttpApplication)source;

			string uri = application.Context.Request.Url.GetComponents(UriComponents.Path, UriFormat.SafeUnescaped);

			if (uri.StartsWith("/"))
			{
				uri = uri.Substring(1);
			}
			if (uri.EndsWith("/"))
			{
				uri = uri.Substring(0, uri.Length - 1);
			}

			if (uri.Equals("umbraco/AuthorizeUpgrade", StringComparison.InvariantCultureIgnoreCase))
			{
				var wrapper = new HttpContextWrapper(HttpContext.Current);
				var webSecurity = new WebSecurity(wrapper, Umbraco.Core.ApplicationContext.Current);
				var userService = Umbraco.Core.ApplicationContext.Current.Services.UserService;
				var userId = userService.GetUserById(0);

				if (userId != null)
				{
					webSecurity.PerformLogin(userId);

					var query = application.Context.Request.Url.GetComponents(UriComponents.Query, UriFormat.SafeUnescaped);
					if (query.StartsWith("redir="))
					{
						var redir = query.Substring(6);
						var page = HttpUtility.UrlDecode(redir);
						application.Context.Response.Redirect(page);
					}
				}
			}

			if (uri.StartsWith("umbraco/setpassword/", StringComparison.InvariantCultureIgnoreCase))
			{
				var userEmail = uri.Substring(20);

				var wrapper = new HttpContextWrapper(HttpContext.Current);
				var webSecurity = new WebSecurity(wrapper, Umbraco.Core.ApplicationContext.Current);
				var userService = Umbraco.Core.ApplicationContext.Current.Services.UserService;
				var userProvider = Umbraco.Core.Security.MembershipProviderExtensions.GetUsersMembershipProvider();


				var userName = userProvider.GetUserNameByEmail(userEmail);

				var user = userProvider.GetUser(userName, false);

				userProvider.ChangePassword(userName, "password", "password");

				if (userProvider.ValidateUser(userName, "password"))
				{
					user = userProvider.GetUser(userName, false);
					webSecurity.PerformLogin((int) user.ProviderUserKey);
					application.Context.Response.Redirect("/umbraco/");
				}
			}

			if (uri.StartsWith("umbraco/autologin/", StringComparison.InvariantCultureIgnoreCase))
			{
				var userEmail = uri.Substring(18);

				var wrapper = new HttpContextWrapper(HttpContext.Current);
				var webSecurity = new WebSecurity(wrapper, Umbraco.Core.ApplicationContext.Current);
				var userService = Umbraco.Core.ApplicationContext.Current.Services.UserService;
				var userProvider = Umbraco.Core.Security.MembershipProviderExtensions.GetUsersMembershipProvider();


				var userName = userProvider.GetUserNameByEmail(userEmail);

				var user = userProvider.GetUser(userName, false);
				webSecurity.PerformLogin((int)user.ProviderUserKey);
				application.Context.Response.Redirect("/umbraco/");
			}

		}

		public void Dispose() { }
	}
}
