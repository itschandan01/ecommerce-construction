// client/src/components/CategoryNav.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const CategoryNav = ({ onCategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [activeId, setActiveId] = useState(null);

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

  const safeCategories = Array.isArray(categories) ? categories : [];
  const parentCategories = safeCategories.filter(cat => !cat.parent_id);
  const displayCategories = parentCategories.length > 0 ? parentCategories : safeCategories;

  const handleParentClick = (id) => {
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
      <h3 className="sidebar-title">
        <span>Categories</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--color-orange-primary)' }}>📦</span>
      </h3>

      {displayCategories.map((parent) => {
        const children = safeCategories.filter(
          (child) => child.parent_id && Number(child.parent_id) === Number(parent.id)
        );
        const hasChildren = children.length > 0;

        return (
          <div key={parent.id} className="category-block">
            <div
              className={`category-header ${activeId === parent.id ? "active" : ""}`}
              onClick={() => handleParentClick(parent.id)}
            >
              <span>{parent.name}</span>
              {hasChildren && <span style={{ fontWeight: 800 }}>{openCategory === parent.id ? "−" : "+"}</span>}
            </div>

            {hasChildren && openCategory === parent.id && (
              <ul className="subcategory-list">
                {children.map((child) => (
                  <li
                    key={child.id}
                    className={activeId === child.id ? "active" : ""}
                    onClick={(e) => handleSubClick(e, child.id)}
                  >
                    ▸ {child.name}
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