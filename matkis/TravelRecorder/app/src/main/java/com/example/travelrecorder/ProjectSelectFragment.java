package com.example.travelrecorder;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.travelrecorder.databinding.FragmentProjectSelectBinding;

public class ProjectSelectFragment extends Fragment {

    private MainActivity activity;
    private FragmentProjectSelectBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentProjectSelectBinding.inflate(inflater, container, false);
        activity = (MainActivity)getActivity();
        initButtons();
        return binding.getRoot();
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
    }

    private void initButtons() {
        binding.btnAddProject.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                showNewProjectDialog();
            }
        });
    }

    private void showNewProjectDialog() {
        NewProjectDialog pd = new NewProjectDialog();
        pd.show(activity.getSupportFragmentManager(), "pindialog");
    }

}
