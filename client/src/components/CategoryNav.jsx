// import React, { useState } from "react";

// const CATEGORY_TREE = [
//   {
//     name: "Cement & Concrete",
//     children: ["OPC Cement", "PPC Cement", "Ready Mix Concrete"],
//   },
//   {
//     name: "Bricks & Blocks",
//     children: ["Red Bricks", "Fly Ash Bricks", "AAC Blocks"],
//   },
//   {
//     name: "Steel & Reinforcement",
//     children: ["TMT Bars", "Binding Wire", "Steel Angles"],
//   },
//   {
//     name: "Aggregates",
//     children: ["Sand (Fine / Coarse)", "Gravel"],
//   },
//   {
//     name: "Plumbing",
//     children: ["PVC Pipes", "CPVC Pipes", "Valves & Fittings"],
//   },
//   {
//     name: "Electrical",
//     children: ["Wires & Cables", "Switches", "Conduits"],
//   },
//   {
//     name: "Finishing Materials",
//     children: ["Tiles", "Paints", "Putty"],
//   },
//   {
//     name: "Tools & Equipment",
//     children: ["Drilling Machines", "Safety Helmets", "Gloves"],
//   },
// ];

// const CategoryNav = ({ onCategorySelect }) => {
//   const [openCategory, setOpenCategory] = useState(null);
//   const [activeItem, setActiveItem] = useState(null);

//   const toggleCategory = (name) => {
//     setOpenCategory(openCategory === name ? null : name);
//   };

//   const selectItem = (item) => {
//     setActiveItem(item);
//     onCategorySelect(item); // works with search/filter
//   };

//   return (
//     <div className="category-sidebar">
//       <h3 className="sidebar-title">Construction Materials</h3>

//       {CATEGORY_TREE.map((cat) => (
//         <div key={cat.name} className="category-block">
//           <div
//             className="category-header"
//             onClick={() => toggleCategory(cat.name)}
//           >
//             {cat.name}
//             <span>{openCategory === cat.name ? "−" : "+"}</span>
//           </div>

//           {openCategory === cat.name && (
//             <ul className="subcategory-list">
//               {cat.children.map((item) => (
//                 <li
//                   key={item}
//                   className={activeItem === item ? "active" : ""}
//                   onClick={() => selectItem(item)}
//                 >
//                   {item}
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default CategoryNav;

// client/src/components/CategoryNav.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryNav = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [activeId, setActiveId] = useState(null);

  // 1. Fetch real categories from your DB
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`);
        if (Array.isArray(res.data)) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Safe category array check
  const safeCategories = Array.isArray(categories) ? categories : [];
  // Filter to get top-level categories (no parent_id or parent_id is null)
  const parentCategories = safeCategories.filter(cat => !cat.parent_id);
  // If no parent categories match hierarchy (e.g. flat schema), fallback to all categories
  const displayCategories = parentCategories.length > 0 ? parentCategories : safeCategories;

  const handleParentClick = (id, name) => {
    setOpenCategory(openCategory === id ? null : id);
    setActiveId(id);
    onCategorySelect(id);
  };

  const handleSubClick = (e, id) => {
    e.stopPropagation();
    setActiveId(id);
    onCategorySelect(id);
  };

  return (
    <div className="category-sidebar">
      <h3 className="sidebar-title">Construction Materials</h3>

      {displayCategories.map((parent) => {
        const children = safeCategories.filter(
          (child) => child.parent_id && Number(child.parent_id) === Number(parent.id)
        );
        const hasChildren = children.length > 0;

        return (
          <div key={parent.id} className="category-block">
            <div
              className={`category-header ${activeId === parent.id ? "active" : ""}`}
              onClick={() => handleParentClick(parent.id, parent.name)}
            >
              {parent.name}
              {hasChildren && <span>{openCategory === parent.id ? "−" : "+"}</span>}
            </div>

            {hasChildren && openCategory === parent.id && (
              <ul className="subcategory-list">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className={activeId === child.id ? "active" : ""}
                    onClick={(e) => handleSubClick(e, child.id)}
                  >
                    {child.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryNav;