'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { Document } from '@/types';
import ImageUpload from '@/components/ImageUpload';

const categories = ['All', 'Income', 'Expense', 'Receipt', 'Contract', 'Other'];

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newDoc, setNewDoc] = useState({
    title: '',
    category: 'expense' as Document['category'],
    amount: '',
    document_date: '',
    description: '',
    file_url: '',
    file_name: '',
    file_type: '',
  });
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setDocuments(data as Document[] || []);
    setLoading(false);
  };

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newDoc.title.trim()) return;

    const { error } = await supabase.from('documents').insert({
      user_id: user.id,
      title: newDoc.title.trim(),
      category: newDoc.category,
      amount: newDoc.amount ? parseFloat(newDoc.amount) : null,
      document_date: newDoc.document_date || null,
      description: newDoc.description || null,
      file_url: newDoc.file_url || null,
      file_name: newDoc.file_name || null,
      file_type: newDoc.file_type || null,
    });

    if (!error) {
      setNewDoc({ title: '', category: 'expense', amount: '', document_date: '', description: '', file_url: '', file_name: '', file_type: '' });
      setShowAddForm(false);
      loadDocuments();
    }
  };

  const deleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    loadDocuments();
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalAmount = filteredDocs.reduce((sum, d) => sum + (d.amount || 0), 0);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'income': return '💰';
      case 'expense': return '💸';
      case 'receipt': return '🧾';
      case 'contract': return '📄';
      default: return '📎';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-accent)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Documents
        </h2>
        <button onClick={() => setShowAddForm(!showAddForm)} className="planner-button">
          {showAddForm ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {categories.slice(1).map((cat) => {
          const count = documents.filter((d) => d.category === cat.toLowerCase()).length;
          const amount = documents.filter((d) => d.category === cat.toLowerCase()).reduce((s, d) => s + (d.amount || 0), 0);
          return (
            <div key={cat} className="planner-card text-center p-3">
              <p className="text-2xl">{getCategoryIcon(cat.toLowerCase())}</p>
              <p className="text-lg font-serif mt-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-accent)' }}>
                {count}
              </p>
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                {cat}
              </p>
              {amount > 0 && (
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  ${amount.toLocaleString()}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={addDocument} className="planner-card space-y-4">
          <h3 className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
            Add Document
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Title</label>
              <input
                type="text"
                value={newDoc.title}
                onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                placeholder="Document title"
                className="planner-input w-full"
                required
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Category</label>
              <select
                value={newDoc.category}
                onChange={(e) => setNewDoc({ ...newDoc, category: e.target.value as Document['category'] })}
                className="planner-input w-full"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="receipt">Receipt</option>
                <option value="contract">Contract</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount</label>
              <input
                type="number"
                step="0.01"
                value={newDoc.amount}
                onChange={(e) => setNewDoc({ ...newDoc, amount: e.target.value })}
                placeholder="0.00"
                className="planner-input w-full"
              />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Date</label>
              <input
                type="date"
                value={newDoc.document_date}
                onChange={(e) => setNewDoc({ ...newDoc, document_date: e.target.value })}
                className="planner-input w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Description</label>
            <textarea
              value={newDoc.description}
              onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
              placeholder="Optional description..."
              className="planner-input w-full resize-none h-20"
            />
          </div>
          <div>
            <label className="text-xs block mb-1" style={{ color: 'var(--color-text-muted)' }}>Attachment</label>
            <ImageUpload
              onUpload={(url, fileName, fileType) => setNewDoc({ ...newDoc, file_url: url, file_name: fileName, file_type: fileType })}
              onClear={() => setNewDoc({ ...newDoc, file_url: '', file_name: '', file_type: '' })}
              existingUrl={newDoc.file_url}
            />
          </div>
          <button type="submit" className="planner-button">
            Save Document
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search documents..."
          className="planner-input text-sm flex-1 min-w-[200px]"
        />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              selectedCategory === cat ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: selectedCategory === cat ? 'var(--color-accent)' : 'var(--color-surface)',
              color: selectedCategory === cat ? 'white' : 'var(--color-text)',
              border: '1px solid var(--color-border)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {selectedCategory !== 'All' && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Total: <span className="font-medium" style={{ color: 'var(--color-accent)' }}>${totalAmount.toLocaleString()}</span>
        </p>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className="planner-card flex items-start gap-3 group">
            {doc.file_url && doc.file_type?.startsWith('image') ? (
              <img
                src={doc.file_url}
                alt=""
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
            ) : (
              <span className="text-2xl shrink-0">{getCategoryIcon(doc.category)}</span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {doc.title}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {doc.description || 'No description'}
                {doc.document_date && ` • ${new Date(doc.document_date).toLocaleDateString()}`}
              </p>
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs inline-flex items-center gap-1 mt-1 hover:underline"
                  style={{ color: 'var(--color-accent)' }}
                >
                  View attachment
                </a>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {doc.amount !== null && (
                <span className="text-sm font-medium" style={{ color: doc.category === 'income' ? 'var(--color-success)' : 'var(--color-text)' }}>
                  ${doc.amount.toLocaleString()}
                </span>
              )}
              <button
                onClick={() => deleteDocument(doc.id)}
                className="text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--color-error)', backgroundColor: 'var(--color-bg)' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <div className="planner-card text-center py-12">
            <p style={{ color: 'var(--color-text-muted)' }}>
              {searchQuery ? 'No documents match your search.' : 'No documents yet. Add your first one!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
