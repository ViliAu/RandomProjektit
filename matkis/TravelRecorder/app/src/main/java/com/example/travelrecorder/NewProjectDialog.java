package com.example.travelrecorder;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatDialogFragment;

import com.google.android.material.textfield.TextInputLayout;

public class NewProjectDialog extends AppCompatDialogFragment {

    private EditText textEditor;
    private TextInputLayout input;
    private PinDialogListener listener;

    @NonNull
    @Override
    public Dialog onCreateDialog(@Nullable Bundle savedInstanceState) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        LayoutInflater inflater = getActivity().getLayoutInflater();
        View view = inflater.inflate(R.layout.dialog_new_project, null);
        builder.setView(view).setTitle("Create project").setNegativeButton("Cancel", null)
                .setPositiveButton("Confirm", new DialogInterface.OnClickListener() {
                    @Override
                    public void onClick(DialogInterface dialogInterface, int i) {
                        createProject();
                    }
                });
        initElements(view);
        return builder.create();
    }

    // Set texts to represent the right info
    private void initElements(View view) {
        // Init elements
        textEditor = view.findViewById(R.id.et_project);
        input = view.findViewById(R.id.input_project);
    }

    private void createProject() {
        // KATO ONKO ROJU JO OLEMAS TAI ONKO STRINGI TYHJÄ

    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        try {
            listener = (PinDialogListener) context;
        }
        catch (ClassCastException e) {
            System.err.println("LOGGER: "+e);
        }
    }

    public interface PinDialogListener {
        void createProject(int id);
    }
}