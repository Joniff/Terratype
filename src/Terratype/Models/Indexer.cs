using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Models
{
	public abstract class Indexer : Terratype.Frisk.IFrisk
	{
        public abstract string Id { get; }

		public abstract bool Add(string key, Terratype.Models.Model model, IEnumerable<string> ancestors);

		public abstract bool Delete(string key);

		public abstract IEnumerable<Terratype.Models.Model> Search(string ancestor);

        public static IDictionary<string, Type> Register
        {
            get
            {
                return Frisk.Frisk.Register<Indexer>();
            }
        }
	}
}
