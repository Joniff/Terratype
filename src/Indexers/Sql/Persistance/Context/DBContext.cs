using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Persistence;
using Umbraco.Core.Persistence.SqlSyntax;

namespace Terratype.Indexers.Sql.Persistance.Context
{
	internal class DBContext
	{
        internal UmbracoDatabase Database => ApplicationContext.Current.DatabaseContext.Database;
        protected ISqlSyntaxProvider Syntax => ApplicationContext.Current.DatabaseContext.SqlSyntax;
	}

    internal static class DbContextExtention
    {
        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="database"></param>
        /// <returns></returns>
        internal static IEnumerable<T> FetchAll<T>(this UmbracoDatabase database)
        {
            return database.Fetch<T>(new Umbraco.Core.Persistence.Sql().Select("*").From<T>(ApplicationContext.Current.DatabaseContext.SqlSyntax));
        }
    }
}
